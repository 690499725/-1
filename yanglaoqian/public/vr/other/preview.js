$(function () {
    setTimeout(showclose, 5000);

    /*by  wcy 图片添加缩放功能*/
    if (is_mobile < 0) {
        $(document).on("mousewheel DOMMouseScroll", ".layui-layer-phimg img", function (e) {
            var delta = (e.originalEvent.wheelDelta && (e.originalEvent.wheelDelta > 0 ? 1 : -1)) ||
                (e.originalEvent.detail && (e.originalEvent.detail > 0 ? -1 : 1));
            var imagep = $(".layui-layer-phimg").parent().parent();
            var image = $(".layui-layer-phimg").parent();
            var h = image.height();
            var w = image.width();
            if (delta > 0) {
                if (h < 2 * (window.innerHeight)) {
                    h = h * 1.05;
                    w = w * 1.05;
                }
            } else if (delta < 0) {
                if (h > 100) {
                    h = h * 0.95;
                    w = w * 0.95;
                }
            }
            image.height(h);
            image.width(w);
            imagep.height(h);
            imagep.width(w);
        });
    }
});

function changeImg2() {
    var $targetObj = $('body .layui-layer-phimg img');
    cat.touchjs.init($targetObj, function (left, top, scale, rotate) {
        $targetObj.css({
            left: left,
            top: top,
            'transform': 'scale(' + scale + ')',
        });
    });
    cat.touchjs.drag($targetObj, function (left, top) {
    });
    cat.touchjs.scale($targetObj, function (scale) {
    });
}

/*自定义执行方法*/
function loadView() {
    if (app_referer == 1) {
        krpano.set("layer[logcontainer].x", 30);
    }
    if (app_referer == 2) {
        krpano.set("layer[logcontainer].visible", false);
    }
    if (isbigscreen == 1) {
        krpano.set("layer[logcontainer].y", 40);
        krpano.set("layer[mapcontainer].y", 40);
    }
    if (is_mobile > 0 && isbigscreen != 1) {
        krpano.set("layer[logcontainer].y", 20);
    }
    /*vip过期还原logo水印*/
    if (has_expired == 1) {
        krpano.set("layer[jelogo].visible", true);
        krpano.set("layer[jelogo].url", vr_water_origin);
    }

    krpano.set("layer[skin_layer].y", -120);
    krpano.set("layer[skin_scroll_window].y", 0);

    /*设置开场广告*/
    $("#bodyclass").hide();
    $("body").css('background-color', '');

    if (is_mobile > 0) {
        $('#panoMoblie').attr('style', 'display:flex;');
        $('#pano-wrapper').remove();
        $('#yuyue').remove();
    } else {
        $('#panoMoblie').remove();
        $('#pano-wrapper').attr('style', 'display:block;');
        $('#mobile_yuyue').remove();
    }

    /*头部滚动广告*/
    if (advertStatus > 0) {
        $(".top-advert").show();
        $("#container").roll({speed: .5});
    }

    let skin_x = krpano.get("layer[skin_btn_vr].x");
    let skin_y = Math.abs(krpano.get("layer[skin_layer].y"));

    if (!navigator.userAgent.match(/ipad/i)) {
        $(".pano-revision-moblie").removeClass("pano-revision-ipad");
        var _shin_btn_fs = krpano.get("layer[skin_btn_fs].align");
        if (_shin_btn_fs == 'rightbottom') {
            $(".pano-revision-moblie .fixed-design").css({
                "right": `${skin_x - 4}px`,
                "left": 'none',
                "bottom": `${skin_y + 230}px`
            });
        } else {
            $(".pano-revision-moblie .fixed-design").css({
                "left": `${skin_x}px`,
                "bottom": `${skin_y + 230}px`,
                "right": 'none',
            });
        }
        $(".pano-revision-moblie").removeClass("none-revision");
    } else {
        $(".pano-revision-moblie").addClass("pano-revision-ipad");
        $(".pano-revision-moblie .fixed-design").css({
            "right": `${skin_x - 2}px`,
            "left": 'none',
            "bottom": `${skin_y + 380}px`
        });
        $(".pano-revision-moblie .fixed-design i").css({
            "width": `33px`,
            "height": '33px',
        });
        $(".pano-revision-moblie").removeClass("none-revision");
    }
    checkOrient();
    if (vr_isWxAndroid == 1) {
        _SessionStoragejson = localStorage.getItem('SessionStoragejson');
        var jsonEntity = JSON.parse(_SessionStoragejson);
        if (jsonEntity._panoId == PANOID) {
            krpano.call("loadscene(" + jsonEntity._sceneName + ",null,MERGE,BLEND(0.8));");
            krpano.call("skin_view_normal();");
            krpano.set("VIEW.hlookat", jsonEntity._hlookat);
            krpano.set("VIEW.vlookat", jsonEntity._vlookat);
            localStorage.clear();
        }
    }
    /***************微官网图标******************/
    if (vip_auth_micro > 0) {
        $('.p_class_micro_icon').hide();
    }
    /***************顶部滚动广告******************/
    if (vip_auth_TopAdvert > 0) {
        $(".top-advert").hide();
    }
    /***************作品logo水印******************/
    if (vip_auth_watermark > 0) {
        krpano.set("layer[jelogo].visible", true);
        krpano.set("layer[jelogo].url", vip_auth_watermark_origin);
    }
}

/*自动弹出场景预览图*/
if (vr_model_group != 0 && pano_setting_showthumbs == 'true') {
    if (bodyclass == 'body-class') {
        setTimeout(function () {
            $('#tab-shuffling').removeClass('visibility');
        }, 5000);
    } else {
        setTimeout(function () {
            $('#tab-shuffling').removeClass('visibility');
        }, 1000);
    }
}

/*全景点击场景切换回调方法 场景切换执行的函数 执行完成并点击分组tab*/
function clickvrgroup(id) {
    if (vr_model_group == 1) {
        let _id = $('.vr-pano2sceneid-' + id).attr('data-groupid');
        let _index = $('.vr-pano2sceneid-' + id).attr('data-index');
        let _groupindex = $('.nav-tab-groupid-' + id).attr('data-index');
        $('.nav-tab-groupid-' + _id).click();
        $('.vr-pano2sceneid-' + id).addClass('swiper-slide-active swiper-slide-thumb-active').siblings('.swiper-slide').removeClass('swiper-slide-active swiper-slide-thumb-active');
        tag_index = $('.vr-pano2sceneid-' + id).attr('data-index');
        galleryThumbs.slideTo(_index);
        galleryTop.slideTo(_groupindex);
        initAudioHotspot();
    }
}

/**无户型图时 每次加载场景执行**/
function onloadscenerun() {
    initAudioHotspot();
}

/**有户型图时 每次操作场景是执行**/
function sandTargetToSandid(sceneid) {
    initAudioHotspot();
    removeSandboxsandspotAll();
    /*当前展开的sceneid*/
    /*console.log('调用-->' + sceneid);*/
    if (_sandTargetToSandid[sceneid]) {
        /*获取当前户型图ID*/
        var _sanid = _sandTargetToSandid[sceneid];
        /*console.log('sandid-->'+_sanid);*/
        /*处理户型图背景展示信息*/
        krpano.set("layer[mapcontainer].visible", true);
        /*krpano.set("layer[mapcontainer].width", parseInt(_sandTargetToSandInfoList['spot' + _sanid].width) + 8);*/
        /*krpano.set("layer[mapcontainer].height", parseInt(_sandTargetToSandInfoList['spot' + _sanid].height) + 8);*/
        krpano.set("layer[sandbox].url", _sandTargetToSandInfoList['spot' + _sanid].pic);
        krpano.set("layer[sandbox].onclick", 'js(opensand(' + _sandTargetToSandInfoList['spot' + _sanid].pic + '))');
        /*krpano.set("layer[sandbox].width", _sandTargetToSandInfoList['spot' + _sanid].width);*/
        /*krpano.set("layer[sandbox].height", _sandTargetToSandInfoList['spot' + _sanid].height);*/
        krpano.call("set(layer[activespot].visible, false);");
        /*console.log('krpano.set("layer[mapcontainer].visible", true)');
        console.log('krpano.set("layer[mapcontainer].width", '+ (parseInt(_sandTargetToSandInfoList['spot'+_sanid].width) + 8) +');');
        console.log('krpano.set("layer[mapcontainer].height", '+ (parseInt(_sandTargetToSandInfoList['spot'+_sanid].height) + 8) +');');
        console.log('krpano.set("layer[sandbox].width", '+_sandTargetToSandInfoList['spot'+_sanid].width+');');
        console.log('krpano.set("layer[sandbox].height", '+_sandTargetToSandInfoList['spot'+_sanid].height+');');*/
        /*处理户型图背景展示信息*/
        /*左边标识的展示*/
        /*loadSandBoxIcon(_sandTargetToSandInfoList['spot' + _sanid].type, _sandTargetToSandInfoList['spot' + _sanid].width);*/
        loadSandBoxIcon(_sandTargetToSandInfoList['spot' + _sanid].type, krpano.get("layer[mapcontainer].width"));
        /*添加户型图上的热点*/
        if (_sandTargetToSandList['spot' + _sanid]) {
            $.each(_sandTargetToSandList['spot' + _sanid], function (i, v) {
                /* console.log("krpano.call('addsandboxhotspotnew(sandspot" + v.target + "," + v.x + "," + v.y + "," + "," + v.isopen + ")')");*/
                krpano.call("addsandboxhotspotnew(sandspot" + v.target + "," + v.x + "," + v.y + "," + v.target + "," + v.isopen + ")");
            });
        }
        /* 操作选中的场景*/
        loadSandBoxSpotActive(_sandTargetToSandList['spot' + _sanid]);
        /*对户型图进行适配*/
        krpano.call("resizemap();");
        /*默认关闭户型图*/
        if (_sandTargetToSandInfoList['spot' + _sanid].is_open == '2') {
            /* console.log("默认关闭户型图--"+_sandTargetToSandInfoList['spot'+_sanid].is_open);*/
            var _sandBoxmapsonoff = krpano.get("layer[mapsonoff].onoroff");
            if (parseInt(_sandBoxmapsonoff) == 1) {
                krpano.call("swapmaps();");
            }
        } else {
            var _sandBoxmapsonoff = krpano.get("layer[mapsonoff].onoroff");
            if (parseInt(_sandBoxmapsonoff) != 1) {
                krpano.call("swapmaps();");
            }
        }
    } else {
        krpano.set("layer[mapcontainer].visible", false);
    }
}

/*** 户型图热点选中状态 ***/
function loadSandBoxSpotActive(spotlist) {
    var currScene = krpano.get("xml.scene");
    /* console.log("currScene-->" + currScene);*/
    if (currScene == null) return null;
    var _SandBoxCurrSceneActive = currScene.replace("scene_", "");
    $.each(spotlist, function (i, v) {
        /* console.log(v.target + '--->' + _SandBoxCurrSceneActive);*/
        if (v.target == _SandBoxCurrSceneActive) {
            /* console.log('yes-->' + _SandBoxCurrSceneActive);*/
            krpano.set("layer[activespot].x", v.x);
            krpano.set("layer[activespot].y", v.y);
            krpano.set("layer[activespot].visible", true);
        }
    });
}

/**** 点击户型图热点 切换场景 ****/
function sandboxswitchspot(id, isopen) {
    if (id) {
        /**在多分组的情况下**/
        if (vr_model_group == 1) {
            clickvrgroup(id);
        }
        /**如果户型图是默认关闭的 那么点击热点时需要展开**/
        if (isopen == 2) {
            krpano.call("loadscene(scene_" + id + ",null,MERGE,BLEND(0.8));swapmaps();");
        } else {
            krpano.call("loadscene(scene_" + id + ",null,MERGE,BLEND(0.8));");
        }
    }
}

/*展示户型图左边的图片*/
function loadSandBoxIcon(type, width) {
    /*console.log("loadSandBoxIcon-->"+ type,width);*/
    var _sandboxleft, _sandboxright, _sandbox_flag;
    switch (type) {
        case '2':
            _sandbox_flag = 'sp';
            break;
        case '3':
            _sandbox_flag = 'fs';
            break;
        case '4':
            _sandbox_flag = 'pm';
            break;
        default:
            _sandbox_flag = 'hx';
    }
    _sandboxleft = 'other/skin/' + _sandbox_flag + '-l' + (_sandBoxisLanguage == 2 ? '-en' : '') + '.png';
    _sandboxright = 'other/skin/' + _sandbox_flag + '-r' + (_sandBoxisLanguage == 2 ? '-en' : '') + '.png';
    /*console.log('krpano.set("layer[mapsonoff].x",' + (parseInt(width)+8) + ')');
    console.log('krpano.set("layer[mapsonoff].url",' + _sandboxleft + ')');
    console.log('krpano.set("layer[mapsonoff].picon",' + _sandboxright + ')');
    console.log('krpano.set("layer[mapsonoff].picoff",' + _sandboxleft + ')');*/
    /*krpano.set("layer[mapsonoff].x", (parseInt(width) + 8));*/
    krpano.set("layer[mapsonoff].x", (parseInt(width)));
    krpano.set("layer[mapsonoff].url", _sandboxright);
    krpano.set("layer[mapsonoff].picon", _sandboxright);
    krpano.set("layer[mapsonoff].picoff", _sandboxleft);
}

/*删除户型图标记点*/
function removeSandboxsandspotAll() {
    var _sandbox_scene_count = krpano.get("scene.count");
    var _sandbox_scene_id;
    if (_sandbox_scene_count) {
        for (i = 0; i < _sandbox_scene_count; i++) {
            _sandbox_scene_id = krpano.get("scene[" + i + "].id");
            krpano.call("removelayer(sandspot" + _sandbox_scene_id + ");");
        }
    }
    return true;
}

/*点击热点*/
function showBox(id, type) {
    initAudioHotspot();
    $.ajax({
        url: 'other/hotspotinfo.html',
        type: 'get',
        dataType: 'json',
        data: {
            id: id
        }
    }).done(function (data) {
        if (data) {
            if (type == 5) {
                layer.photos({
                    photos: data[id].photos,
                    closeBtn: 1,
                    shade: 0.8,
                    success: function (layero, index) {
                        if (krpano.get("fullscreen")) {
                            $('#krpanoSWFObject').prepend($('#layui-layer-shade' + index).prop('outerHTML') + $('#layui-layer' + index).prop('outerHTML'));
                        }
                        /*禁止图片右击保存*/
                        $(".layui-layer-phimg img").on("contextmenu", function () {
                            return false;
                        });
                        /*changeImg2();*/
                        setTimeout(changeImg2, 5000);
                    },
                    tab: function (pic, layero) {
                        /*changeImg2();*/
                        setTimeout(changeImg2, 5000);
                    },
                    end: function () {
                        layer.closeAll();
                    }
                });
            } else {
                if (type == 4 || type == 6) {
                    let _showBoxType = 1;
                    let _showBoxArea = ['746px', '423px'];
                    if (type == 6) {
                        _showBoxType = 2;
                        _showBoxArea = ['650px', '600px'];
                    }
                    if (is_mobile > 0) {
                        _showBoxArea = ['90%', 'auto'];
                        var ua = navigator.userAgent.toLowerCase();
                        if (/ipad/i.test(ua)) {
                            _showBoxArea = ['746px', '423px'];
                        }
                        if (type == 6) {
                            _showBoxArea = ['90%', '423px'];
                        }
                    }
                    layer.open({
                        type: _showBoxType,
                        title: false,
                        area: _showBoxArea,
                        shade: [0.8, '#393D49'],
                        content: data[id].target,
                        success: function () {
                            onPause();
                        },
                        end: function () {
                            onResume();
                        }
                    });
                } else {
                    layer.msg(data[id].target, {
                        time: 0,
                        area: ["480px", "auto"],
                        closeBtn: true
                    });
                }
            }
        }
    }).fail(function () {
        layer.msg("网络错误！");
    });
}

$(document).on("click", ".layui-layer-close2", function () {
    krpano.call("resumesound(bgsnd);");
});

if (navigator.userAgent.match(/mobile/i)) {
    $(".tel").remove();
}

/*滑动显示图标上的提示*/
$(document).on('mouseenter', '#pano-wrapper li', function () {
    $(".none", this).show();
});
$(document).on('mouseleave', '#pano-wrapper li', function () {
    $(".none", this).hide();
});

/*关闭滚动广告*/
$(document).on('click', '.top-advert .top-close', function (event) {
    $(".top-advert").hide();
});

$(document).on('click', '.share', function () {
    var d = $('.ewm').hasClass('none');
    if (d) {
        $('.ewm').show().removeClass('none');
    } else {
        $('.ewm').hide().addClass('none');
    }
});

function showclose() {
    $(".top-advert .top-close").show();
}

function adverturl() {
    window.open(vr_adv_url);
    return false;
}

function playsound() {
    var status = krpano.get("layer[skin_btn_sound].data");
    if (status == 1) {
        document.getElementById('mp3').pause();
        krpano.set("layer[skin_btn_sound].url", "other/skin/music-new-no.png");
        krpano.set("layer[skin_btn_sound].data", 0);
    } else {
        document.getElementById('mp3').play();
        krpano.set("layer[skin_btn_sound].url", "other/skin/music-new.png");
        krpano.set("layer[skin_btn_sound].data", 1);
        initAudioHotspot();
    }
}

/*切换场景等操作 初始化上一个播放音频的状态*/
function initAudioHotspot() {
    if (audioHotSpotActiveId > 0) {
        var _hotspotmp3_status = $('#HotspotAudio' + audioHotSpotActiveId).attr('status');
        if (_hotspotmp3_status == 'play') {
            document.getElementById('HotspotAudio' + audioHotSpotActiveId).pause();
            $('#HotspotAudio' + audioHotSpotActiveId).attr('status', 'pause');
            krpano.set("hotspot[hotspotname" + audioHotSpotActiveId + "].html", krpano.get("hotspot[hotspotname" + audioHotSpotActiveId + "].htmlbak"));
        }
    }
}

/* 暂停音乐 */
function onPause() {
    if (music > 0) {
        document.getElementById('mp3').pause();
        krpano.set("layer[skin_btn_sound].url", "other/skin/music-new-no.png");
        krpano.set("layer[skin_btn_sound].data", 0);
    }
}

/* 播放音乐 */
function onResume() {
    if (music > 0) {
        document.getElementById('mp3').play();
        krpano.set("layer[skin_btn_sound].url", "other/skin/music-new.png");
        krpano.set("layer[skin_btn_sound].data", 1);
    }
}

/**播放音频热点**/
function hotspotAudio(mp3, id) {
    $('.HotspotAudio').load();
    $('#adoMusic').load();
    if (audioHotSpotActiveId > 0) {
        krpano.set("hotspot[hotspotname" + audioHotSpotActiveId + "].html", krpano.get("hotspot[hotspotname" + audioHotSpotActiveId + "].htmlbak"));
    }
    var _docmp3 = $('#HotspotAudio' + id).attr('src');
    if (!_docmp3) {
        $('body').prepend('<audio class="HotspotAudio" id="HotspotAudio' + id + '" src="' + mp3 + '" status="play" style="display: none;"></audio>');
        document.getElementById('HotspotAudio' + id).play();
        onPause();
        audioHotSpotActiveId = id;
        krpano.set("hotspot[hotspotname" + id + "].html", '播放中...');
    } else {
        var _hotspotmp3_status = $('#HotspotAudio' + id).attr('status');
        if (_hotspotmp3_status == 'play') {
            document.getElementById('HotspotAudio' + id).pause();
            $('#HotspotAudio' + id).attr('status', 'pause');
            krpano.set("hotspot[hotspotname" + id + "].html", krpano.get("hotspot[hotspotname" + id + "].htmlbak"));
            onResume();
        } else {
            $('#HotspotAudio' + id).attr('status', 'play');
            document.getElementById('HotspotAudio' + id).play();
            onPause();
            krpano.set("hotspot[hotspotname" + id + "].html", '播放中...');
        }
    }
}

/* 全景编辑点击热点超链接地址 */
function openHyperlink(url) {
    initAudioHotspot();
    if (vr_isWxAndroid == 1) {
        var SessionStoragejson = {
            _panoId: PANOID,
            _sceneName: krpano.get("scene[get(xml.scene)].name"),
            _hlookat: krpano.get("VIEW.hlookat"),
            _vlookat: krpano.get("VIEW.vlookat"),
        };
        localStorage.setItem('SessionStoragejson', JSON.stringify(SessionStoragejson));
    }
    window.open(url);
}

/**** 设计说明 ****/
function getintro() {
    var area = ['580px', '480px'];
    if (is_mobile > 0) {
        area = ['90%', '400px'];
    }
    layer.open({
        title: intro,
        area: area,
        type: 1,
        content: $('#des_intro')
    });
}

/*横竖屏*/
window.addEventListener('load', function () {
    checkOrient();
    window.onorientationchange = checkOrient;
}, false);

function checkOrient() {
    if (window.orientation == 90 || window.orientation == -90) {
        /*横屏*/
        if (vr_model_group == 1) {
            krpano.set('layer[skin_layer].y', 0);
        } else {
            krpano.set('layer[skin_layer].y', -65);
            let _height = document.body.clientHeight;
            if (_height >= 375 && _height < 720) {
                krpano.set('layer[skin_btn_vr].y', 110);
                krpano.set('layer[skin_btn_sound].y', 160);
                krpano.set('layer[skin_btn_gyro].y', 210);
            }
            if (_height <= 320) {
                krpano.set('layer[skin_btn_vr].y', 80);
                krpano.set('layer[skin_btn_sound].y', 110);
                krpano.set('layer[skin_btn_gyro].y', 160);
            }
        }
        if (!krpano.get("layer[skin_btn_thumbs].visible")) {
            $('#show_scenes').addClass('show_scenes');
        }
        $('.fixed-design').hide();
    } else {
        krpano.set('layer[skin_layer].y', -120);
        $('#show_scenes').removeClass('show_scenes');
        $('.fixed-design').show();
    }
}

/*自动播放音乐*/
function audioAutoPlay(status) {
    if (music > 0 && status == 1) {
        var audio = document.getElementById('mp3');
        audio.play();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    audioAutoPlay(1);
});
document.addEventListener('WeixinJSBridgeReady', function () {
    audioAutoPlay(1);
}, false);
document.addEventListener('touchstart', function () {
    var status = krpano.get("layer[skin_btn_sound].data");
    audioAutoPlay(status);
}, false);

function jsfullScreen() {
    var isFull = !!(document.webkitIsFullScreen || document.mozFullScreen ||
        document.msFullscreenElement || document.fullscreenElement
    );
    if (isFull == false) {
        var element = document.documentElement;
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        }

    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
}

/*顶部滚动*/
(function ($) {
    $.fn.extend({
        roll: function (options) {
            var defaults = {
                speed: 50
            };
            var options = $.extend(defaults, options);
            var speed = (document.all) ? options.speed : Math.max(1, options.speed - 1);
            if ($(this) == null) return;
            var $container = $(this);
            var $content = $("#content");
            var init_left = $container.width();
            $content.css({left: parseInt(init_left) + "px"});
            var This = this;
            var time = setInterval(function () {
                This.move($container, $content, speed);
            }, 50);
            $container.bind("mouseover", function () {
                clearInterval(time);
            });
            $container.bind("mouseout", function () {
                time = setInterval(function () {
                    This.move($container, $content, speed);
                }, 50);
            });
            return this;
        },
        move: function ($container, $content, speed) {
            var container_width = $container.width();
            var content_width = $content.width();
            if (parseInt($content.css("left")) + content_width > 0) {
                $content.css({left: parseInt($content.css("left")) - speed + "px"});
            } else {
                $content.css({left: parseInt(container_width) + "px"});
            }
        }
    });
})(jQuery);

function opensand(url) {
    let originalUrl = url;
    if (url.indexOf('_thumb') > -1) {
        originalUrl = url.replace('_thumb', '');
    }
    let json = {'title': '', 'id': 1, 'start': 0, 'data': [{'alt': '', 'pid': 1, 'src': originalUrl, 'thumb': url}]};
    layer.photos({photos: json});
}

var material_index;
function showMaterial(id) {
    $.ajax({
        url: 'other/hotspotinfo.html',
        type: 'get',
        dataType: 'json',
        data: {
            id: id,
        }
    }).done(function (data){
        if (data) {
            var sceneid = krpano.get("xml.scene").split("_")[1];
            var info = data[id];
            var target = info.target;
            var imgarr = target.split(",");
            var arr = {id: 0, list: []};
            $.each(imgarr, function (k, v) {
                if (k == 0) {
                    arr.id = v;
                } else {
                    var items = v.split("|");
                    var active = items[2] == sceneid ? '' : 'none';
                    arr.list.push({id: items[2], name: items[1], pic: items[0], active: active});
                }
            });
            var _content = template('material-view', arr);
            material_index = layer.open({
                type: 1,
                title: 0,
                shade: 0.7,
                area: ["auto", "auto"],
                shadeClose: true,
                content: _content,
                skin: 'layui-material'
            });
        }
    }).fail(function (){
        layer.msg("网络错误！");
    });
}

function joinscene(id) {
    layer.close(material_index);
    var h = krpano.get("VIEW.hlookat");
    var v = krpano.get("VIEW.vlookat");
    var fov = krpano.get("VIEW.fov");
    krpano.call("loadscene(get(scene[scene_" + id + "].name),null,MERGE,OPENBLEND(0.5, 0.0, 0.75, 0, linear))");
    krpano.set("VIEW.hlookat", h);
    krpano.set("VIEW.vlookat", v);
    krpano.set("VIEW.fov", fov);
}

function jsrotate() {
    var status = krpano.get("layer[rotate].data");
    if (status == 1 || status == null) {
        krpano.call('autorotate.stop();');
        krpano.set("layer[rotate].url", "other/skin/rotate_close.png");
        krpano.set("layer[rotate].data", 0);
    }else{
        krpano.call('autorotate.start();');
        krpano.set("layer[rotate].url", "other/skin/rotate_open.png");
        krpano.set("layer[rotate].data", 1);
    }
}