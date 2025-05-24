(function ($) {
    $.fn.extend({
        roll: function (options) {
            var defaults = {
                speed: 1,
            };
            var options = $.extend(defaults, options);
            var speed = (document.all) ? options.speed : Math.max(1, options.speed - 1);
            if ($(this) == null) return;
            var $container = $(this);
            var $content = $(this).children();
            var init_left = $container.left;
            $content.css({
                left: parseInt(init_left) + "px"
            });
            var This = this;
            AlltimeRollClear = setInterval(function () {
                This.move($container, $content, speed);
            }, 20);


            $container.bind("mouseover", function () {
                if ($container.parent().parent().hasClass('swiper-slide-thumb-active') == true) {
                    if (BoClearTime) {
                        clearTimeout(BoClearTime)
                    }
                    if (AlltimeRollClear) {
                        clearInterval(AlltimeRollClear);
                    }
                }

            });
            $container.bind("mouseout", function () {
                if ($container.parent().parent().hasClass('swiper-slide-thumb-active') == true) {
                    if (BoClearTime) {
                        clearTimeout(BoClearTime)
                    }
                    if (AlltimeRollClear) {
                        clearInterval(AlltimeRollClear);
                    }
                    AlltimeRollClear = setInterval(function () {
                        This.move($container, $content, speed);
                    }, 20);
                }
            });
            return this;
        },

        move: function ($container, $content, speed) {
            var container_width = $container.width();
            var content_width = $content.width();
            if (parseInt($content.css("left")) + content_width > 0) {
                $content.css({
                    left: parseInt($content.css("left")) - speed + "px"
                });
            } else {
                $content.css({
                    left: parseInt(container_width) + "px"
                });
            }
        }
    });
})(jQuery);
console.log(1)
 var AlltimeRollClear=null;
    var BoClearTime=null;
    function handerWordRoll(key){
            BoClearTime=setTimeout(function(){
                if(BoClearTime){
                    clearTimeout(BoClearTime)
                }
                if(AlltimeRollClear) {
                  clearInterval(AlltimeRollClear);
                }

                for(let i=0;i<$(".content_small_tip").length;i++){
                    $(".content_small_tip").addClass("content_small_tip2")
                    $(".content_small_tip").css('left','0px')
                }
                $(`#container_small_tip${key}`).children().eq(0).removeClass("content_small_tip2")
                var _widthXS=$(`#container_small_tip${key}`).parent().width();//实际的宽度
                var _widthWordT=$(`#container_small_tip${key}`).children().eq(0).width()
                if(_widthWordT> _widthXS){
                    $(`#container_small_tip${key}`).roll({ speed: 0.2});
                } else{
                     $(`#content_small_tip${key}`).addClass("content_small_tip2")
                }
            },100)                       
    }