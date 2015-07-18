
(function(window, document) {

    var portfolio = {
        window_position: 0,
        number_per_row: 6,
        additional_page_height: 1000,
        portfolio_items: [{}],
        lastStart: 0
    };

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
            var hash = window.location.hash;
            var pathname = hash.replace("#", "");
            var pathItems = pathname.split("/");
            var pathnameGallery = pathItems[0];
            var pathnameImage = pathItems[1];

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
                window.location.hash = "#" + pathnameGallery;
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
            portfolio.portfolio_items.length = 0;
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
                gallery: this.props.gall,
                position: this.props.position || window.scrollY,
                itemCount: 0
            };
        },
        componentDidMount: function () {
            if (!this.state.gallery) {
                var hash = window.location.hash;
                var pathname = hash.replace("#", "");
                var pathItems = pathname.split("/");
                var pathnameGallery = pathItems[0];
                var pathnameImage = pathItems[1];
            } else {
                var pathnameGallery = this.state.gallery;
            }

            this.state.itemCount = 12;
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
            $.ajax({
                method: "GET",
                url: "http://127.0.0.1:8000/images/" + gallery,
                dataType: "json",
                data: {countStart: start, countEnd: end},
                cache: false,
                success: function (data) {
                  //  console.log("start: ", start + "  |  end: ", end);
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
                        position += 100;
                        start = self.state.itemCount;
                        self.state.itemCount += portfolio.number_per_row;
                        if (portfolio.portfolio_items.length <= start && portfolio.lastStart < start) {
                            portfolio.lastStart = start;
                            self.getItems(start, self.state.itemCount, gallery);
                        }
                        self.render();
                    }
                }
            }
        },

        getFullImage: function (index, id) {
            portfolio.window_position = window.scrollY;
            var img = "/static/" + this.state.images_full[index];
            React.render(
                <FullImage fullImg={img} hash={id} position={this.state.position} />,
                document.getElementById("images")
            );
        },
        render: function () {

            var images = [<div></div>],
                src = "",
                bindFullImage = (function(){});

            for (var index = 0, len=this.state.images_thumbs.length; index<len; index++) {
                src = "/static/" + this.state.images_thumbs[index];
                bindFullImage = this.getFullImage.bind(this, index, this.state.image_ids[index]);
                images[index] = <div key={this.state.image_ids[index]} className="portfolioSmall col-md-3">
                                    <img onClick={bindFullImage} src={src} />
                                </div>;
            }

            return (
                <div className="row">
                    {images}
                </div>
            );
        }
    });


    var FullImage = React.createClass({
        getInitialState: function () {
            return {
                image: this.props.fullImg,
                image_hash: this.props.hash
            };
        },


        componentDidMount: function () {
            var hash = window.location.hash;
            var pathname = hash.replace("#", "");
            var pathItems = pathname.split("/");
            var pathnameGallery = pathItems[0];

            window.location.hash = "#" + pathnameGallery + "/" + this.props.hash;
            window.scrollTo(0, 130);

            if (!this.state.image) {
                var self = this;
                $.ajax({
                    type: "GET",
                    url: "http://127.0.0.1:8000/images/" + pathnameGallery,
                    dataType: "json",
                    data: {countEnd: "all"},
                    cache: false,
                    success: function (data) {
                        console.log("data: ", data);
                        var images = [],
                            ids = [];
                        for (var i = 0, len=data.length; i<len; i++) {
                            images[i] = data[i].fields.image;
                            ids[i] = data[i].fields.item_id;
                        }

                        var index = ids.indexOf(self.props.hash);

                        self.setState({image: "/static/" + images[index]});
                    },
                    error: function (xhr, status, err) {
                        console.error("http://127.0.0.1:8000/images/" + pathnameGallery, status, err.toString());
                    }
                });
            }

            React.render(
                <BackToGalleryButton gall={pathnameGallery} position={this.props.position} />,
                document.getElementById("backToGallery")
            );

        },

        render: function () {
            return (
                <div>
                    <div className="largeImageContainer">
                        <img ref="fullImage" className="portfolioLarge col-md-9 col-md-offset-1" src={this.state.image} />
                    </div>
                    <div id="backToGallery" className="col-md-4 col-md-offset-1"></div>
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
