
(function(window, document) {

    var portfolio = {
        portfolio_items: [{}],
        images: []
    };

    portfolio.window_position = 0;
    portfolio.number_per_row = 3;
    portfolio.additional_page_height = 1000;
    portfolio.lastStart = 0;


    var Galleries = React.createClass({
        getInitialState: function () {
            return {
                galleries: [],
                galleries_urls: [],
                gallery_main_images: [],
                pageTop: 0
            };
        },

        setPage: function () {
            var hash = window.location.hash,
                pathname = hash.replace("#", ""),
                pathItems = pathname.split("/"),
                pathnameGallery = pathItems[0],
                pathnameImage = pathItems[1];

            if (!hash) {
                React.render(
                    <Title title={"Home"} />,
                    document.getElementById("title")
                );
                React.render(
                    <HomePageGalleryLink images={this.state.gallery_main_images} urls={this.state.galleries_urls} />,
                    document.getElementById("images")
                );
            }
            else if (hash && !pathnameImage) {
                console.log("hash: ", hash);
           //     window.location.hash = "#" + pathnameGallery;
                var clear = <div></div>;
                React.render(
                    clear,
                    document.getElementById("images")
                );

                var gallTitleIndex = this.state.galleries_urls.indexOf(pathnameGallery);
                var gallTitle = this.state.galleries[gallTitleIndex];
                React.render(
                    <Title title={gallTitle} />,
                    document.getElementById("title")
                );
                console.log("pathnameGallery: ", pathnameGallery);

                React.render(
                    <ImageThumbs gall={pathnameGallery} />,
                    document.getElementById("images")
                );
            } else {
                window.location.hash = "#" + pathnameGallery + "/" + pathnameImage;
                React.render(
                    <FullImage hash={pathnameImage} />,
                    document.getElementById("images")
                );
            }
        },

        componentDidMount: function () {
            $.ajax({
                type: "GET",
                url: "http://127.0.0.1:8000/galleries/",
                dataType: "json",
                cache: false,
                success: function (data) {
                    var gall = [""],
                        gall_url = [""],
                        gall_main_img = [""];

                    for (var i = 0, len=data.length; i<len; i++) {
                        gall[i] = data[i].fields.title;
                        gall_url[i] = data[i].fields.gallery_url;
                        gall_main_img[i] = data[i].fields.main_image;
                    }
                    this.setState({
                        galleries: gall,
                        galleries_urls: gall_url,
                        gallery_main_images: gall_main_img
                    });

                    this.setPage();
                }.bind(this),
                error: function (xhr, status, err) {
                    console.error("http://127.0.0.1:8000/galleries/", status, err.toString);
                }.bind(this)
            });

            var self = this;
            window.onhashchange = function () {
                self.setPage();
            };
        },
        onHashChange: function (id) {
            console.log("id: ", id);
            portfolio.portfolio_items.length = 0;
            portfolio.images.length = 0;
            portfolio.window_position = 0;
            portfolio.lastStart = 0;
            if (typeof id === "string") {
                window.location.hash = "#" + id;
            } else {
                window.location.hash = "#";
            }
            window.scrollTo(0, portfolio.window_position);
        },
        render: function () {
            var self = this;
            var navItems = this.state.galleries.map(function (gallery, key) {
                var bondOnHashChange = self.onHashChange.bind(this, this.state.galleries_urls[key]);
                return (
                    <div onClick={bondOnHashChange}  className="navItem col-md-2">
                {gallery}
                    </div>
                );
            }.bind(this));
            return (
                <div>
                    <div onClick={this.onHashChange} className="navItem col-md-2">Home</div>
                {navItems}
                </div>
            );
        }
    });


    var HomePageGalleryLink = React.createClass({
        getInitialState: function () {
            return {
                main_images: this.props.images,
                galleries_urls: this.props.urls
            }
        },
        onHashChange: function (id) {
            window.location.hash = "#" + id;
        },
        render: function () {
            var self = this;
            var main_images = this.state.main_images.map(function(image, key) {
                var img = "/static/" + image;
                var boundOnHashChange = self.onHashChange.bind(this, self.state.galleries_urls[key]);
                return (
                    <div className="homePageGalleryLink col-md-5 col-md-offset-1">
                        <img onClick={boundOnHashChange} src={img} />
                    </div>
                )
            });
            return (
                <div className="row">
                {main_images}
                </div>
            );
        }
    });


    var ImageThumbs = React.createClass({

        getInitialState: function () {
            return {
                images_thumbs: [],
                images_full: [],
                image_ids: [],
             //   gallery: this.props.gall,
                position: this.props.position || window.scrollY,
                itemCount: 0
            };
        },
        componentDidMount: function () {
            $(".imagesContainer").removeClass("noBorder");
            if (/* !this.state.gallery */ !this.props.gall) {
                var hash = window.location.hash;
                var pathname = hash.replace("#", "");
                var pathItems = pathname.split("/");
                var pathnameGallery = pathItems[0];
              //  var pathnameImage = pathItems[1];
            } else {
                var pathnameGallery = this.props.gall; // this.state.gallery;
            }
        //    console.log("portfolio.portfolio_items: ", portfolio.portfolio_items);
            this.state.itemCount = 9;
            if (portfolio.portfolio_items.length < this.state.itemCount) {
                this.getItems(0, this.state.itemCount, pathnameGallery);
            } else {
                var img_thumbs = [""],
                    img_full = [""],
                    img_ids = [""];
                for (var i = 0, len=portfolio.portfolio_items.length; i<len; i++) {
                    img_thumbs[i] = portfolio.portfolio_items[i].fields.thumbnail_image;
                    img_full[i] = portfolio.portfolio_items[i].fields.image;
                    img_ids[i] = portfolio.portfolio_items[i].fields.item_id;
                }
                this.setState({
                    images_thumbs: img_thumbs,
                    images_full: img_full,
                    image_ids: img_ids
                });
            }

            $("body").height(portfolio.window_position + portfolio.additional_page_height);
            window.scrollTo(0, portfolio.window_position);
            this.getAdditionalItems(pathnameGallery);

            window.location.hash = "#" + pathnameGallery;
        },

        getItems: function(start, end, gallery) {
            console.log("gallery: ", gallery);
            $.ajax({
                method: "GET",
                url: "http://127.0.0.1:8000/images/" + gallery,
                dataType: "json",
                data: {countStart: start, countEnd: end},
                cache: false,
                success: function (data) {
               //     console.log("start: ", start + "  |  end: ", end);
                    if (start === 0) {
                        portfolio.portfolio_items = data;
                    } else {
                        portfolio.portfolio_items = portfolio.portfolio_items.concat(data);
                    }
                    var img_thumbs = [""],
                        img_full = [""],
                        img_ids = [""];
                    for (var i = 0, len=portfolio.portfolio_items.length; i<len; i++) {
                        img_thumbs[i] = portfolio.portfolio_items[i].fields.thumbnail_image;
                        img_full[i] = portfolio.portfolio_items[i].fields.image;
                        img_ids[i] = portfolio.portfolio_items[i].fields.item_id;
                    }

                    this.setState({
                        images_thumbs: img_thumbs,
                        images_full: img_full,
                        image_ids: img_ids
                    });
                }.bind(this),
                error: function (xhr, status, err) {
                    console.error("http://127.0.0.1:8000/images", status, err.toString());
                }.bind(this)
            });
        },

        getAdditionalItems: function (gallery) {
            var self = this,
                start = 0,
                position = 100;

            window.onscroll = function () {
                if (window.scrollY >= position) {
                    if (portfolio.lastStart < portfolio.portfolio_items.length) {
                        position += 190;
                        start = self.state.itemCount;
                        self.state.itemCount += portfolio.number_per_row;
                        if (portfolio.portfolio_items.length <= start && portfolio.lastStart < start) {
                            portfolio.lastStart = start;
                            self.getItems(start, self.state.itemCount, gallery);
                        }
                    }
                }
            }
        },



        getFullImage: function (index, id) {
            portfolio.window_position = window.scrollY;
            var img = this.state.images_full[index];
            React.render(
                <FullImage fullImg={img} hash={id} position={this.state.position} />,
                document.getElementById("images")
            );
        },
        render: function () {

            var src = "",
                bindFullImage = (function(){});

            for (var index = portfolio.images.length, len=this.state.images_thumbs.length; index<len; index++) {
                src = "/static/" + this.state.images_thumbs[index];
                bindFullImage = this.getFullImage.bind(this, index, this.state.image_ids[index]);
                portfolio.images[index] = <div key={this.state.image_ids[index]} className="portfolioSmall col-lg-3">
                                              <img onClick={bindFullImage} src={src} />
                                          </div>;
            }

            return (
                <div className="row">
                    {portfolio.images}
                </div>
            );
        }
    });





    var FullImage = React.createClass({
        getInitialState: function () {
            return {
                image: this.props.fullImg || "",
                images: [],
                ids: [],
                image_hash: this.props.hash,
                pathnameGallery: "",
                index: -1
            };
        },

        getAllImages: function(start, end) {
            var self = this;
            $.ajax({
                type: "GET",
                url: "http://127.0.0.1:8000/images/" + self.state.pathnameGallery,
                dataType: "json",
                data: {countStart: start,
                    countEnd: end},
                cache: false,
                success: function (data) {
                    console.log("data: ", data);
                    if (data.length > 0) {
                        for (var i = 0, len = data.length; i < len; i++) {
                            self.state.images.push(data[i].fields.image);
                            self.state.ids.push(data[i].fields.item_id);
                        }
                        console.log("self.props.hash: ", self.props.hash);
                        console.log("self.state.index: ", self.state.index);
                        if (this.state.index === -1) {
                            if (self.props.hash) {
                                self.setState({index: self.state.ids.indexOf(self.props.hash)});
                            }
                            else if (!self.props.hash && self.props.index) {
                                self.setState({index: self.props.index});
                            }
                        }
                        console.log("self.state.index: ", self.state.index);
                        self.setHashAndImage();
                    } else {
                        console.log("no data");
                        self.state.index = 0;
                        self.setHashAndImage();
                    }

                }.bind(this),
                error: function (xhr, status, err) {
                    console.error("http://127.0.0.1:8000/images/" + self.state.pathnameGallery, status, err.toString());
                }.bind(this)
            });
        },

        renderDirectionalButtons: function() {
            console.log("this.state.index: ", this.state.index);
            React.render(
                <NextPreviousButton direction="previous" index={this.state.index} />,
                document.getElementById("previousButton")
            );

            React.render(
                <NextPreviousButton direction="next" index={this.state.index} />,
                document.getElementById("nextButton")
            );
        },

        displayBackToGallery: function() {
            var self = this;
            setTimeout(function() {
                var fullImageHeight = self.refs.fullImage.getDOMNode().offsetHeight;
                console.log("fullImageHeight: ", fullImageHeight);
                $("#backToGallery").css({"margin-top": fullImageHeight})
                                   .show();
            }, 150);
        },

        setHashAndImage: function() {
            window.location.hash = "#" + this.state.pathnameGallery + "/" + this.state.ids[this.state.index];
            this.setState({image: this.state.images[this.state.index]});
        },


        componentDidMount: function () {
            $(".imagesContainer").addClass("noBorder");
            var hash = window.location.hash,
                pathname = hash.replace("#", ""),
                pathItems = pathname.split("/");
            this.state.pathnameGallery = pathItems[0];

            window.location.hash = "#" + this.state.pathnameGallery + "/" + this.props.hash;
            window.scrollTo(0, 160);


            if (!this.state.image) {
                this.getAllImages(null, "all");
            } else {
              //  this.setState({image: this.props.image});
                for (var i = 0, len=portfolio.portfolio_items.length; i<len; i++) {
                    this.state.images[i] = portfolio.portfolio_items[i].fields.image;
                    this.state.ids[i] = portfolio.portfolio_items[i].fields.item_id;
                }
            }

            React.render(
                <BackToGalleryButton gall={this.state.pathnameGallery} position={this.props.position} />,
                document.getElementById("backToGallery")
            );

             var height = $(window).height(),
                width = $("#images").width() * .80;

            $(".portfolioLarge").css({"max-width": width, "max-height": height - 150});
            $(".largeImageContainer").css({"max-height": height});
            $("#backToGallery").hide();
            this.displayBackToGallery();

        },

        renderNextPreviousImage: function(direction) {
            if (this.state.index === -1) {
                this.state.index = this.state.images.indexOf(this.state.image);
            }
            console.log("this.state.index: ", this.state.index);
            if (direction === "next") {
                this.state.index++;
            }
            else if (direction === "previous") {
                this.state.index--;
            }
            console.log("this.state.images["+this.state.index+"]: " + this.state.images[this.state.index]);
            if (!this.state.images[this.state.index]) {
                if (this.state.index !== -1) {
                    this.getAllImages(this.state.index, this.state.index + 1);
                } else {
                    this.state.index = this.state.images.length - 1;
                    this.setHashAndImage();
                }
            } else {
                this.setHashAndImage();
            }

            this.displayBackToGallery();
        },


        render: function () {
            var image = "/static/" + this.state.image,
                next = this.renderNextPreviousImage.bind(this, "next"),
                previous = this.renderNextPreviousImage.bind(this, "previous");
            return (
                <div>
                    <div ref="fullImage" className="largeImageContainer">
                        <img className="portfolioLarge" src={image} />
                    </div>
                    <div id="backToGallery" className="col-md-4 col-md-offset-1"></div>
                    <div id="previousButton"><div onClick={previous} className="previous">Previous</div></div>
                    <div id="nextButton"><div onClick={next} className="next">Next</div></div>
                </div>
            );
        }
    });



    var BackToGalleryButton = React.createClass({
        getInitialState: function () {
            return {gallery: this.props.gall}
        },

        backToGallery: function () {
            window.location.hash = "#" + this.state.gallery;
        },

        render: function () {
            return (
                <button onClick={this.backToGallery}>Return To Gallery</button>
            );
        }

    });


    var Title = React.createClass({
        render: function () {
            return (
                <span>{this.props.title}</span>
            );
        }
    });


    React.render(
        <Galleries />,
        document.getElementById("navBar")
    );


}(window, document));
