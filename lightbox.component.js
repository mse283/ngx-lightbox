"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var common_1 = require("@angular/common");
var core_1 = require("@angular/core");
var platform_browser_1 = require("@angular/platform-browser");
var lightbox_event_service_1 = require("./lightbox-event.service");
var LightboxComponent = /** @class */ (function () {
    function LightboxComponent(_elemRef, _rendererRef, _lightboxEvent, _lightboxElem, _lightboxWindowRef, _sanitizer, _documentRef) {
        var _this = this;
        this._elemRef = _elemRef;
        this._rendererRef = _rendererRef;
        this._lightboxEvent = _lightboxEvent;
        this._lightboxElem = _lightboxElem;
        this._lightboxWindowRef = _lightboxWindowRef;
        this._sanitizer = _sanitizer;
        this._documentRef = _documentRef;
        // initialize data
        this.options = this.options || {};
        this.album = this.album || [];
        this.currentImageIndex = this.currentImageIndex || 0;
        this._windowRef = this._lightboxWindowRef.nativeWindow;
        // control the interactive of the directive
        this.ui = {
            // control the appear of the reloader
            // false: image has loaded completely and ready to be shown
            // true: image is still loading
            showReloader: true,
            // control the appear of the nav arrow
            // the arrowNav is the parent of both left and right arrow
            // in some cases, the parent shows but the child does not show
            showLeftArrow: false,
            showRightArrow: false,
            showArrowNav: false,
            // control whether to show the
            // page number or not
            showPageNumber: false,
            showCaption: false,
            classList: 'lightbox animation fadeIn'
        };
        this.content = {
            pageNumber: ''
        };
        this._event = {};
        this._lightboxElem = this._elemRef;
        this._event.subscription = this._lightboxEvent.lightboxEvent$
            .subscribe(function (event) { return _this._onReceivedEvent(event); });
    }
    LightboxComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.album.forEach(function (album) {
            if (album.caption) {
                album.caption = _this._sanitizer.sanitize(core_1.SecurityContext.HTML, album.caption);
            }
        });
    };
    LightboxComponent.prototype.ngAfterViewInit = function () {
        // need to init css value here, after the view ready
        // actually these values are always 0
        this._cssValue = {
            containerTopPadding: Math.round(this._getCssStyleValue(this._containerElem, 'padding-top')),
            containerRightPadding: Math.round(this._getCssStyleValue(this._containerElem, 'padding-right')),
            containerBottomPadding: Math.round(this._getCssStyleValue(this._containerElem, 'padding-bottom')),
            containerLeftPadding: Math.round(this._getCssStyleValue(this._containerElem, 'padding-left')),
            imageBorderWidthTop: Math.round(this._getCssStyleValue(this._imageElem, 'border-top-width')),
            imageBorderWidthBottom: Math.round(this._getCssStyleValue(this._imageElem, 'border-bottom-width')),
            imageBorderWidthLeft: Math.round(this._getCssStyleValue(this._imageElem, 'border-left-width')),
            imageBorderWidthRight: Math.round(this._getCssStyleValue(this._imageElem, 'border-right-width'))
        };
        if (this._validateInputData()) {
            this._prepareComponent();
            this._registerImageLoadingEvent();
        }
    };
    LightboxComponent.prototype.ngOnDestroy = function () {
        if (!this.options.disableKeyboardNav) {
            // unbind keyboard event
            this._disableKeyboardNav();
        }
        this._event.subscription.unsubscribe();
    };
    LightboxComponent.prototype.close = function ($event) {
        $event.stopPropagation();
        if ($event.target.classList.contains('lightbox') ||
            $event.target.classList.contains('lb-loader') ||
            $event.target.classList.contains('lb-close')) {
            this._lightboxEvent.broadcastLightboxEvent({ id: lightbox_event_service_1.LIGHTBOX_EVENT.CLOSE, data: null });
        }
    };
    LightboxComponent.prototype.nextImage = function () {
        if (this.album.length === 1) {
            return;
        }
        else if (this.currentImageIndex === this.album.length - 1) {
            this._changeImage(0);
        }
        else {
            this._changeImage(this.currentImageIndex + 1);
        }
    };
    LightboxComponent.prototype.prevImage = function () {
        if (this.album.length === 1) {
            return;
        }
        else if (this.currentImageIndex === 0 && this.album.length > 1) {
            this._changeImage(this.album.length - 1);
        }
        else {
            this._changeImage(this.currentImageIndex - 1);
        }
    };
    LightboxComponent.prototype._validateInputData = function () {
        if (this.album &&
            this.album instanceof Array &&
            this.album.length > 0) {
            for (var i = 0; i < this.album.length; i++) {
                // check whether each _nside
                // album has src data or not
                if (this.album[i].src) {
                    continue;
                }
                throw new Error('One of the album data does not have source data');
            }
        }
        else {
            throw new Error('No album data or album data is not correct in type');
        }
        // to prevent data understand as string
        // convert it to number
        if (isNaN(this.currentImageIndex)) {
            throw new Error('Current image index is not a number');
        }
        else {
            this.currentImageIndex = Number(this.currentImageIndex);
        }
        return true;
    };
    LightboxComponent.prototype._registerImageLoadingEvent = function () {
        var _this = this;
        var preloader = new Image();
        preloader.onload = function () {
            _this._onLoadImageSuccess();
        };
        var src = this.album[this.currentImageIndex].src;
        preloader.src = this._sanitizer.sanitize(core_1.SecurityContext.URL, src);
    };
    /**
     * Fire when the image is loaded
     */
    LightboxComponent.prototype._onLoadImageSuccess = function () {
        if (!this.options.disableKeyboardNav) {
            // unbind keyboard event during transition
            this._disableKeyboardNav();
        }
        var imageHeight;
        var imageWidth;
        var maxImageHeight;
        var maxImageWidth;
        var windowHeight;
        var windowWidth;
        var naturalImageWidth;
        var naturalImageHeight;
        // set default width and height of image to be its natural
        imageWidth = naturalImageWidth = this._imageElem.nativeElement.naturalWidth;
        imageHeight = naturalImageHeight = this._imageElem.nativeElement.naturalHeight;
        if (this.options.fitImageInViewPort) {
            windowWidth = this._windowRef.innerWidth;
            windowHeight = this._windowRef.innerHeight;
            maxImageWidth = windowWidth - this._cssValue.containerLeftPadding -
                this._cssValue.containerRightPadding - this._cssValue.imageBorderWidthLeft -
                this._cssValue.imageBorderWidthRight - 20;
            maxImageHeight = windowHeight - this._cssValue.containerTopPadding -
                this._cssValue.containerTopPadding - this._cssValue.imageBorderWidthTop -
                this._cssValue.imageBorderWidthBottom - 120;
            if (naturalImageWidth > maxImageWidth || naturalImageHeight > maxImageHeight) {
                if ((naturalImageWidth / maxImageWidth) > (naturalImageHeight / maxImageHeight)) {
                    imageWidth = maxImageWidth;
                    imageHeight = Math.round(naturalImageHeight / (naturalImageWidth / imageWidth));
                }
                else {
                    imageHeight = maxImageHeight;
                    imageWidth = Math.round(naturalImageWidth / (naturalImageHeight / imageHeight));
                }
            }
            this._rendererRef.setElementStyle(this._imageElem.nativeElement, 'width', imageWidth + "px");
            this._rendererRef.setElementStyle(this._imageElem.nativeElement, 'height', imageHeight + "px");
        }
        this._sizeContainer(imageWidth, imageHeight);
        if (this.options.centerVertically) {
            this._centerVertically(imageWidth, imageHeight);
        }
    };
    LightboxComponent.prototype._centerVertically = function (imageWidth, imageHeight) {
        var scrollOffset = this._documentRef.documentElement.scrollTop;
        var windowHeight = this._windowRef.innerHeight;
        var viewOffset = windowHeight / 2 - imageHeight / 2;
        var topDistance = scrollOffset + viewOffset;
        this._rendererRef.setElementStyle(this._lightboxElem.nativeElement, 'top', topDistance + "px");
    };
    LightboxComponent.prototype._sizeContainer = function (imageWidth, imageHeight) {
        var _this = this;
        var oldWidth = this._outerContainerElem.nativeElement.offsetWidth;
        var oldHeight = this._outerContainerElem.nativeElement.offsetHeight;
        var newWidth = imageWidth + this._cssValue.containerRightPadding + this._cssValue.containerLeftPadding +
            this._cssValue.imageBorderWidthLeft + this._cssValue.imageBorderWidthRight;
        var newHeight = imageHeight + this._cssValue.containerTopPadding + this._cssValue.containerBottomPadding +
            this._cssValue.imageBorderWidthTop + this._cssValue.imageBorderWidthBottom;
        if (oldWidth !== newWidth || oldHeight !== newHeight) {
            this._rendererRef.setElementStyle(this._outerContainerElem.nativeElement, 'width', newWidth + "px");
            this._rendererRef.setElementStyle(this._outerContainerElem.nativeElement, 'height', newHeight + "px");
            // bind resize event to outer container
            // use enableTransition to prevent infinite loader
            if (this.options.enableTransition) {
                this._event.transitions = [];
                ['transitionend', 'webkitTransitionEnd', 'oTransitionEnd', 'MSTransitionEnd'].forEach(function (eventName) {
                    _this._event.transitions.push(_this._rendererRef.listen(_this._outerContainerElem.nativeElement, eventName, function (event) {
                        if (event.target === event.currentTarget) {
                            _this._postResize(newWidth, newHeight);
                        }
                    }));
                });
            }
            else {
                this._postResize(newWidth, newHeight);
            }
        }
        else {
            this._postResize(newWidth, newHeight);
        }
    };
    LightboxComponent.prototype._postResize = function (newWidth, newHeight) {
        // unbind resize event
        if (Array.isArray(this._event.transitions)) {
            this._event.transitions.forEach(function (eventHandler) {
                eventHandler();
            });
            this._event.transitions = [];
        }
        this._rendererRef.setElementStyle(this._dataContainerElem.nativeElement, 'width', newWidth + "px");
        this._showImage();
    };
    LightboxComponent.prototype._showImage = function () {
        this.ui.showReloader = false;
        this._updateNav();
        this._updateDetails();
        if (!this.options.disableKeyboardNav) {
            this._enableKeyboardNav();
        }
    };
    LightboxComponent.prototype._prepareComponent = function () {
        // add css3 animation
        this._addCssAnimation();
        // position the image according to user's option
        this._positionLightBox();
    };
    LightboxComponent.prototype._positionLightBox = function () {
        // @see https://stackoverflow.com/questions/3464876/javascript-get-window-x-y-position-for-scroll
        var top = (this._windowRef.pageYOffset || this._documentRef.documentElement.scrollTop) +
            this.options.positionFromTop;
        var left = this._windowRef.pageXOffset || this._documentRef.documentElement.scrollLeft;
        if (!this.options.centerVertically) {
            this._rendererRef.setElementStyle(this._lightboxElem.nativeElement, 'top', top + "px");
        }
        this._rendererRef.setElementStyle(this._lightboxElem.nativeElement, 'left', left + "px");
        this._rendererRef.setElementStyle(this._lightboxElem.nativeElement, 'display', 'block');
        // disable scrolling of the page while open
        if (this.options.disableScrolling) {
            this._rendererRef.setElementClass(this._documentRef.documentElement, 'lb-disable-scrolling', true);
        }
    };
    /**
     * addCssAnimation add css3 classes for animate lightbox
     */
    LightboxComponent.prototype._addCssAnimation = function () {
        var resizeDuration = this.options.resizeDuration;
        var fadeDuration = this.options.fadeDuration;
        this._rendererRef.setElementStyle(this._lightboxElem.nativeElement, '-webkit-animation-duration', fadeDuration + "s");
        this._rendererRef.setElementStyle(this._lightboxElem.nativeElement, 'animation-duration', fadeDuration + "s");
        this._rendererRef.setElementStyle(this._outerContainerElem.nativeElement, '-webkit-transition-duration', resizeDuration + "s");
        this._rendererRef.setElementStyle(this._outerContainerElem.nativeElement, 'transition-duration', resizeDuration + "s");
        this._rendererRef.setElementStyle(this._dataContainerElem.nativeElement, '-webkit-animation-duration', fadeDuration + "s");
        this._rendererRef.setElementStyle(this._dataContainerElem.nativeElement, 'animation-duration', fadeDuration + "s");
        this._rendererRef.setElementStyle(this._imageElem.nativeElement, '-webkit-animation-duration', fadeDuration + "s");
        this._rendererRef.setElementStyle(this._imageElem.nativeElement, 'animation-duration', fadeDuration + "s");
        this._rendererRef.setElementStyle(this._captionElem.nativeElement, '-webkit-animation-duration', fadeDuration + "s");
        this._rendererRef.setElementStyle(this._captionElem.nativeElement, 'animation-duration', fadeDuration + "s");
        this._rendererRef.setElementStyle(this._numberElem.nativeElement, '-webkit-animation-duration', fadeDuration + "s");
        this._rendererRef.setElementStyle(this._numberElem.nativeElement, 'animation-duration', fadeDuration + "s");
    };
    LightboxComponent.prototype._end = function () {
        var _this = this;
        this.ui.classList = 'lightbox animation fadeOut';
        if (this.options.disableScrolling) {
            this._rendererRef.setElementClass(this._documentRef.documentElement, 'lb-disable-scrolling', false);
        }
        setTimeout(function () {
            _this.cmpRef.destroy();
        }, this.options.fadeDuration * 1000);
    };
    LightboxComponent.prototype._updateDetails = function () {
        // update the caption
        if (typeof this.album[this.currentImageIndex].caption !== 'undefined' &&
            this.album[this.currentImageIndex].caption !== '') {
            this.ui.showCaption = true;
        }
        // update the page number if user choose to do so
        // does not perform numbering the page if the
        // array length in album <= 1
        if (this.album.length > 1 && this.options.showImageNumberLabel) {
            this.ui.showPageNumber = true;
            this.content.pageNumber = this._albumLabel();
        }
    };
    LightboxComponent.prototype._albumLabel = function () {
        // due to {this.currentImageIndex} is set from 0 to {this.album.length} - 1
        return this.options.albumLabel.replace(/%1/g, Number(this.currentImageIndex + 1)).replace(/%2/g, this.album.length);
    };
    LightboxComponent.prototype._changeImage = function (newIndex) {
        this.currentImageIndex = newIndex;
        this._hideImage();
        this._registerImageLoadingEvent();
        this._lightboxEvent.broadcastLightboxEvent({ id: lightbox_event_service_1.LIGHTBOX_EVENT.CHANGE_PAGE, data: newIndex });
    };
    LightboxComponent.prototype._hideImage = function () {
        this.ui.showReloader = true;
        this.ui.showArrowNav = false;
        this.ui.showLeftArrow = false;
        this.ui.showRightArrow = false;
        this.ui.showPageNumber = false;
        this.ui.showCaption = false;
    };
    LightboxComponent.prototype._updateNav = function () {
        var alwaysShowNav = false;
        // check to see the browser support touch event
        try {
            this._documentRef.createEvent('TouchEvent');
            alwaysShowNav = (this.options.alwaysShowNavOnTouchDevices) ? true : false;
        }
        catch (e) {
            // noop
        }
        // initially show the arrow nav
        // which is the parent of both left and right nav
        this._showArrowNav();
        if (this.album.length > 1) {
            if (this.options.wrapAround) {
                if (alwaysShowNav) {
                    // alternatives this.$lightbox.find('.lb-prev, .lb-next').css('opacity', '1');
                    this._rendererRef.setElementStyle(this._leftArrowElem.nativeElement, 'opacity', '1');
                    this._rendererRef.setElementStyle(this._rightArrowElem.nativeElement, 'opacity', '1');
                }
                // alternatives this.$lightbox.find('.lb-prev, .lb-next').show();
                this._showLeftArrowNav();
                this._showRightArrowNav();
            }
            else {
                if (this.currentImageIndex > 0) {
                    // alternatives this.$lightbox.find('.lb-prev').show();
                    this._showLeftArrowNav();
                    if (alwaysShowNav) {
                        // alternatives this.$lightbox.find('.lb-prev').css('opacity', '1');
                        this._rendererRef.setElementStyle(this._leftArrowElem.nativeElement, 'opacity', '1');
                    }
                }
                if (this.currentImageIndex < this.album.length - 1) {
                    // alternatives this.$lightbox.find('.lb-next').show();
                    this._showRightArrowNav();
                    if (alwaysShowNav) {
                        // alternatives this.$lightbox.find('.lb-next').css('opacity', '1');
                        this._rendererRef.setElementStyle(this._rightArrowElem.nativeElement, 'opacity', '1');
                    }
                }
            }
        }
    };
    LightboxComponent.prototype._showLeftArrowNav = function () {
        this.ui.showLeftArrow = true;
    };
    LightboxComponent.prototype._showRightArrowNav = function () {
        this.ui.showRightArrow = true;
    };
    LightboxComponent.prototype._showArrowNav = function () {
        this.ui.showArrowNav = (this.album.length !== 1);
    };
    LightboxComponent.prototype._enableKeyboardNav = function () {
        var _this = this;
        this._event.keyup = this._rendererRef.listenGlobal('document', 'keyup', function (event) {
            _this._keyboardAction(event);
        });
    };
    LightboxComponent.prototype._disableKeyboardNav = function () {
        if (this._event.keyup) {
            this._event.keyup();
        }
    };
    LightboxComponent.prototype._keyboardAction = function ($event) {
        var KEYCODE_ESC = 27;
        var KEYCODE_LEFTARROW = 37;
        var KEYCODE_RIGHTARROW = 39;
        var keycode = $event.keyCode;
        var key = String.fromCharCode(keycode).toLowerCase();
        if (keycode === KEYCODE_ESC || key.match(/x|o|c/)) {
            this._lightboxEvent.broadcastLightboxEvent({ id: lightbox_event_service_1.LIGHTBOX_EVENT.CLOSE, data: null });
        }
        else if (key === 'p' || keycode === KEYCODE_LEFTARROW) {
            if (this.currentImageIndex !== 0) {
                this._changeImage(this.currentImageIndex - 1);
            }
            else if (this.options.wrapAround && this.album.length > 1) {
                this._changeImage(this.album.length - 1);
            }
        }
        else if (key === 'n' || keycode === KEYCODE_RIGHTARROW) {
            if (this.currentImageIndex !== this.album.length - 1) {
                this._changeImage(this.currentImageIndex + 1);
            }
            else if (this.options.wrapAround && this.album.length > 1) {
                this._changeImage(0);
            }
        }
    };
    LightboxComponent.prototype._getCssStyleValue = function (elem, propertyName) {
        return parseFloat(this._windowRef
            .getComputedStyle(elem.nativeElement, null)
            .getPropertyValue(propertyName));
    };
    LightboxComponent.prototype._onReceivedEvent = function (event) {
        switch (event.id) {
            case lightbox_event_service_1.LIGHTBOX_EVENT.CLOSE:
                this._end();
                break;
            default:
                break;
        }
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], LightboxComponent.prototype, "album", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Number)
    ], LightboxComponent.prototype, "currentImageIndex", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], LightboxComponent.prototype, "options", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], LightboxComponent.prototype, "cmpRef", void 0);
    __decorate([
        core_1.ViewChild('outerContainer', { static: false }),
        __metadata("design:type", core_1.ElementRef)
    ], LightboxComponent.prototype, "_outerContainerElem", void 0);
    __decorate([
        core_1.ViewChild('container', { static: false }),
        __metadata("design:type", core_1.ElementRef)
    ], LightboxComponent.prototype, "_containerElem", void 0);
    __decorate([
        core_1.ViewChild('leftArrow', { static: false }),
        __metadata("design:type", core_1.ElementRef)
    ], LightboxComponent.prototype, "_leftArrowElem", void 0);
    __decorate([
        core_1.ViewChild('rightArrow', { static: false }),
        __metadata("design:type", core_1.ElementRef)
    ], LightboxComponent.prototype, "_rightArrowElem", void 0);
    __decorate([
        core_1.ViewChild('navArrow', { static: false }),
        __metadata("design:type", core_1.ElementRef)
    ], LightboxComponent.prototype, "_navArrowElem", void 0);
    __decorate([
        core_1.ViewChild('dataContainer', { static: false }),
        __metadata("design:type", core_1.ElementRef)
    ], LightboxComponent.prototype, "_dataContainerElem", void 0);
    __decorate([
        core_1.ViewChild('image', { static: false }),
        __metadata("design:type", core_1.ElementRef)
    ], LightboxComponent.prototype, "_imageElem", void 0);
    __decorate([
        core_1.ViewChild('caption', { static: false }),
        __metadata("design:type", core_1.ElementRef)
    ], LightboxComponent.prototype, "_captionElem", void 0);
    __decorate([
        core_1.ViewChild('number', { static: false }),
        __metadata("design:type", core_1.ElementRef)
    ], LightboxComponent.prototype, "_numberElem", void 0);
    LightboxComponent = __decorate([
        core_1.Component({
            template: "\n    <div class=\"lb-outerContainer transition\" #outerContainer>\n      <div class=\"lb-container\" #container>\n        <img class=\"lb-image\" [src]=\"album[currentImageIndex].src\" class=\"lb-image animation fadeIn\" [hidden]=\"ui.showReloader\" #image>\n        <div class=\"lb-nav\" [hidden]=\"!ui.showArrowNav\" #navArrow>\n          <a class=\"lb-prev\" [hidden]=\"!ui.showLeftArrow\" (click)=\"prevImage()\" #leftArrow></a>\n          <a class=\"lb-next\"[hidden]=\"!ui.showRightArrow\" (click)=\"nextImage()\" #rightArrow></a>\n        </div>\n        <div class=\"lb-loader\" [hidden]=\"!ui.showReloader\" (click)=\"close($event)\">\n          <a class=\"lb-cancel\"></a>\n        </div>\n      </div>\n    </div>\n    <div class=\"lb-dataContainer\" [hidden]=\"ui.showReloader\" #dataContainer>\n      <div class=\"lb-data\">\n        <div class=\"lb-details\">\n          <span class=\"lb-caption animation fadeIn\" [hidden]=\"!ui.showCaption\" [innerHtml]=\"album[currentImageIndex].caption\" #caption>\n          </span>\n          <span class=\"lb-number animation fadeIn\" [hidden]=\"!ui.showPageNumber\" #number>{{ content.pageNumber }}</span>\n        </div>\n        <div class=\"lb-closeContainer\">\n          <a class=\"lb-close\" (click)=\"close($event)\"></a>\n        </div>\n      </div>\n    </div>",
            selector: '[lb-content]',
            host: {
                '(click)': 'close($event)',
                '[class]': 'ui.classList'
            }
        }),
        __param(6, core_1.Inject(common_1.DOCUMENT)),
        __metadata("design:paramtypes", [core_1.ElementRef,
            core_1.Renderer,
            lightbox_event_service_1.LightboxEvent,
            core_1.ElementRef,
            lightbox_event_service_1.LightboxWindowRef,
            platform_browser_1.DomSanitizer, Object])
    ], LightboxComponent);
    return LightboxComponent;
}());
exports.LightboxComponent = LightboxComponent;
//# sourceMappingURL=lightbox.component.js.map