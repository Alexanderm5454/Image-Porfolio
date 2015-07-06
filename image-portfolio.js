/**
 * Created by alexandermarkowski on 7/1/15.
 */

(function($, window, document, undefined) {


    function PortfolioItemList() {
        this.portfolioGalleries = {};
        this.galleryTitles = {};
        this.portfolioItems = {};
        this.rootElmId = "images";
        this.pageTop = null;
        this.hash = window.location.hash;
        this.pathname = window.location.hash;
        this.pathname = this.pathname.replace("#", "");
        var pathItems = this.pathname.split("/");
        this.pathnameGallery = pathItems[0];
        this.pathnameImage = pathItems[1];
        console.log("this.pathnameImage: ", this.pathnameImage);
        this.galleriesUrlRoot = "http://127.0.0.1:8000/portfolio/galleries/";
        this.imageUrlRoot = "http://127.0.0.1:8000/portfolio/images/";
    }


    PortfolioItemList.prototype.getGalleries = function() {
        var self = this;
        $.ajax({
            type: "GET",
            url: this.galleriesUrlRoot,
            dataType: "json",
            cache: false,
            success: function(data) {
                setPortfolioGalleries(data);
            },
            error: function(xhr, status, err) {
                console.error(self.galleriesUrlRoot, status, err.toString());
            }
        });

        function setPortfolioGalleries(data) {
            self.portfolioGalleries = data;
            self.showGalleries();
        }

    };

    PortfolioItemList.prototype.showGalleries = function() {

        for (var i = 0, len=this.portfolioGalleries.length; i<len; i++) {
            var tempElm = document.createElement("div");
            $(tempElm).addClass("navItem col-md-2")
                .attr("id", this.portfolioGalleries[i].fields.gallery_url)
                .text(this.portfolioGalleries[i].fields.title);
            $("#navBar").append(tempElm);

            this.galleryTitles[this.portfolioGalleries[i].fields.gallery_url] = this.portfolioGalleries[i].fields.title;

            tempElm = null;
        }
        var self = this;
        $(".navItem").click(function() {
            self.pageTop = 0;
            var id = $(this).attr("id");
            var title = self.galleryTitles[id];
            $("#title").text(title);
            window.location.hash = id;
        });
    };


    PortfolioItemList.prototype.getItems = function() {
        var self = this;
        $.ajax({
            type: "GET",
            url: this.imageUrlRoot + this.pathnameGallery,
            dataType: "json",
            cache: false,
            success: function(data) {
                setPortfolioItems(data);
            },
            error: function(xhr, status, err) {
                console.error(this.imageUrlRoot + self.pathnameGallery, status, err.toString());
            }
        });
        function setPortfolioItems(data) {
            self.portfolioItems = data;
            if (!self.pathnameImage) {
                self.showItems();
            } else {
                var tempPathnameImage = "#" + self.pathnameImage;
                self.pathnameImage = null;
                self.showFullImage(tempPathnameImage);
            }
        }
    };

    PortfolioItemList.prototype.handleUrl = function() {
        console.log("this.hash: ", this.hash);
        var self = this;
        window.onhashchange = function() {
            if (self.pageTop) {
                console.log("self.pageTop: ", self.pageTop);
                window.scrollTo(0, self.pageTop);
            } else {
                window.scrollTo(0, 0);
            }
            self.pathname = window.location.hash;
            self.pathname = self.pathname.replace("#", "");
            var pathItems = self.pathname.split("/");
            self.pathnameGallery = pathItems[0];

            var tempHash = self.hash.replace("#", "");
            var hashItems = tempHash.split("/");
            var hashRoot = hashItems[0];

            self.hash = window.location.hash;

            console.log("self.hash: ", self.hash);

            if (self.hash === ("#" +self.pathnameGallery)) {
                $("#" + self.rootElmId).html("");
                self.showItems();
            }
            if (self.pathnameGallery !== hashRoot) {
                $("#" + self.rootElmId).html("");
                self.getItems();
            } else {
                self.showFullImage(self.hash);
            }

        }
    };

    PortfolioItemList.prototype.showItems = function() {

        for (var i = 0, len=this.portfolioItems.length; i<len; i++) {
            var tempElm = document.createElement("div");
            $(tempElm).addClass("portfolioSmall col-md-2 col-md-offset-2");

            var tempImgElm = document.createElement("img");
            $(tempImgElm).attr("id", this.portfolioItems[i].fields.item_id);
            tempImgElm.src = "/static/" + this.portfolioItems[i].fields.thumbnail_image;

            if (i % 2 === 0) {
                var tempRow = document.createElement("div");
            }

            $(tempElm).html(tempImgElm);
            $(tempRow).append(tempElm);

            if (i % 2 === 0) {
                $(tempRow).addClass("row");
                $("#" + this.rootElmId).append(tempRow);
            }
            $(".portfolioSmall").hide();
            tempElm = null;
            tempImgElm = null;
        }


        $(".portfolioSmall").fadeIn();

        var self = this;
        $(".portfolioSmall").click(function() {
            self.pageTop = window.scrollY;
            self.showFullImage(this);
        });

    };

    PortfolioItemList.prototype.showFullImage = function(img) {
        var self = this;

        var imageIndex,
            imgId;

        var tempElm = document.createElement("div");
        $(tempElm).addClass("largeImageContainer");

        var largeImageElm = document.createElement("img");
        $(largeImageElm).addClass("portfolioLarge col-md-8");

        if (img.nodeType === 1) {
            imgId = $(img).first().children().attr("id");
        }
        else if (typeof img === "string") {
            imgId = img.slice(1, img.length);
            imgId = imgId.replace(this.pathnameGallery + "/", "");
        }
        console.log("imgId: ", imgId);
        for (var i = 0, len=self.portfolioItems.length; i<len; i++) {
            if (imgId === self.portfolioItems[i].fields.item_id) {
                imageIndex = i;
                break;
            }
        }

        largeImageElm.src = "/static/" + self.portfolioItems[imageIndex].fields.image;
        $(tempElm).append(largeImageElm);

        this.hash = "#" + this.pathnameGallery + "/" + imgId;
        console.log("this.hash: ", this.hash);
        $(".portfolioSmall").fadeOut();

        $("#" + self.rootElmId).html("");
        $("#" + self.rootElmId).append(tempElm);

        var descriptionElm = self.createDescriptionElm(imageIndex);

        $("#" + self.rootElmId).append(descriptionElm);
        $(".portfolioLarge").css({"opacity": 0});
        $(".portfolioLarge").animate({"opacity": 1}, 500);

        tempElm = null;
        largeImageElm = null;
        descriptionElm =  null;

        window.location.hash = this.hash;
        window.scrollTo(0, 0);
        $(".portfolioLarge").click(function() {
            $(this).fadeOut(function() {
                console.log("self.pathnameGallery: ", self.pathnameGallery);
                window.location.hash = self.pathnameGallery;
            });
        });

    };

    PortfolioItemList.prototype.createDescriptionElm = function(imgIndex) {
        if (!isNaN(imgIndex)) {
            var imgDescription = this.portfolioItems[imgIndex].fields.description;
            var tempElm = document.createElement("p");
            $(tempElm).addClass("imageDescription col-md-3");
            $(tempElm).text(imgDescription);
            return tempElm;
        }
        return null;
    };

    $(document).ready(function() {
        var itemList = new PortfolioItemList();
        itemList.getGalleries();
        itemList.getItems();
        itemList.handleUrl();
    });
}(jQuery, window, document));
