/*
  Copyright (C) 2023 OpaqueGlass

  This program is released under the AGPLv3 license.
  For details, see:
  - License Text: https://www.gnu.org/licenses/agpl-3.0.html
  - License Summary: https://tldrlegal.com/license/gnu-affero-general-public-license-v3-(agpl-3.0)

  THERE IS NO WARRANTY FOR THE PROGRAM, TO THE EXTENT PERMITTED BY APPLICABLE LAW. EXCEPT WHEN 
  OTHERWISE STATED IN WRITING THE COPYRIGHT HOLDERS AND/OR OTHER PARTIES PROVIDE THE PROGRAM 
  "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, 
  THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE ENTIRE RISK
  AS TO THE QUALITY AND PERFORMANCE OF THE PROGRAM IS WITH YOU. SHOULD THE PROGRAM PROVE DEFECTIVE, 
  YOU ASSUME THE COST OF ALL NECESSARY SERVICING, REPAIR OR CORRECTION.

  IN NO EVENT UNLESS REQUIRED BY APPLICABLE LAW OR AGREED TO IN WRITING WILL ANY COPYRIGHT HOLDER, 
  OR ANY OTHER PARTY WHO MODIFIES AND/OR CONVEYS THE PROGRAM AS PERMITTED ABOVE, BE LIABLE TO YOU 
  FOR DAMAGES, INCLUDING ANY GENERAL, SPECIAL, INCIDENTAL OR CONSEQUENTIAL DAMAGES ARISING OUT OF 
  THE USE OR INABILITY TO USE THE PROGRAM (INCLUDING BUT NOT LIMITED TO LOSS OF DATA OR DATA BEING
  RENDERED INACCURATE OR LOSSES SUSTAINED BY YOU OR THIRD PARTIES OR A FAILURE OF THE PROGRAM TO
  OPERATE WITH ANY OTHER PROGRAMS), EVEN IF SUCH HOLDER OR OTHER PARTY HAS BEEN ADVISED OF THE
  POSSIBILITY OF SUCH DAMAGES.

*/

/**
 * 处理点击事件
 * 为引入本项目，和原代码相比有更改
 * @refer https://github.com/OpaqueGlass/syplugin-doubleClickFileTree/blob/0212e4b89355738a0e3027692639655f2b6e43f7/index.js
 * @license AGPL-3.0 license 
 */

import * as siyuan from "siyuan"

/**
 * 全局变量
 */

export const CONSTANTS = {

    ACTION_OPEN_DOC: 0,
    ACTION_RAW_CLICK: 1,
    ACTION_TRUE_CLICK: 2,

}

let g_isPluginClickToggle = false;
let g_isPluginRawClickItem = false;
let g_setting = {
    dblclickShowSubDoc: null,
    dblclickDelay: null,
    disableChangeIcon: null,
    revertBehavior: null,
    sameToOutline: null,
    extendClickArea: null,
    unfoldSubDocsWhileOpenParent: null,
    openToTop: null,
    lastModifyBlockHint: null,
    ignoreModifyHintIds: "",
    ignoreModifyHintIdsArray: [],
    ignoreModifyHintPathLikeArray: [],
    applyToDialog: null,
    enableMobile: null,
    sameToTag: null,
};

// 入口绑定开始
export function bindBasicEventHandler(removeMode = false, clickActor) {
    const isMobileDevice = isMobile();
    debugPush("绑定开始");
    if (isMobileDevice && !g_setting.enableMobile) {
        debugPush("移动设备，且未启用功能，退出");
        return;
    }
    const tagQuery = isMobileDevice ? "#sidebar [data-type='sidebar-tag']" : ".sy__tag";
    const frontend = siyuan.getFrontend();
    const backend = siyuan.getBackend();

    
    let clickEventBindEventType = "click";
    if (backend == "ios" && frontend == "desktop") {
        errorPush("插件暂未解决iPadOS上的使用问题，在iPadOS上，插件将不绑定任何行为");
        // document.querySelector(fileTreeQuery)?.addEventListener(clickEventBindEventType, preventClickHander, false);
        // clickEventBindEventType = "mouseup";
        return;
    }

    

    // 绑定tag行为
    document.querySelectorAll(tagQuery).forEach((elem)=>{
        elem.removeEventListener(clickEventBindEventType, clickActor, true);
    });

    if (!removeMode) {
        document.querySelectorAll(tagQuery).forEach((elem)=>{
            elem.addEventListener(clickEventBindEventType, clickActor, true);
        });
    }

}


// 入口绑定结束

// debug push
let g_DEBUG = 2;
const g_NAME = "te";
const g_FULLNAME = "标签增强";

/*
LEVEL 0 忽略所有
LEVEL 1 仅Error
LEVEL 2 Err + Warn
LEVEL 3 Err + Warn + Info
LEVEL 4 Err + Warn + Info + Log
LEVEL 5 Err + Warn + Info + Log + Debug
*/
function commonPushCheck() {
    if (window.top["ZXHDGlassDebugV2"] == undefined || window.top["ZXHDGlassDebugV2"][g_NAME] == undefined) {
        return g_DEBUG;
    }
    return window.top["ZXHDGlassDebugV2"][g_NAME];
}


function debugPush(str, ...args) {
    if (commonPushCheck() >= 5) {
        const date = new Date();
        const dateStr = `${date.toLocaleString()}.${String(date.getMilliseconds()).padStart(3, '0')}`;
        console.debug(`${g_FULLNAME}[D] ${dateStr} ${str}`, ...args);
    }
}

function logPush(str, ...args) {
    if (commonPushCheck() >= 4) {
        const date = new Date();
        const dateStr = `${date.toLocaleString()}.${String(date.getMilliseconds()).padStart(3, '0')}`;
        console.log(`${g_FULLNAME}[L] ${dateStr} ${str}`, ...args);
    }
}

function errorPush(str, ... args) {
    if (commonPushCheck() >= 1) {
        const date = new Date();
        const dateStr = `${date.toLocaleString()}.${String(date.getMilliseconds()).padStart(3, '0')}`;
        console.error(`${g_FULLNAME}[E] ${dateStr} ${str}`, ...args);
    }
}

function warnPush(str, ... args) {
    const date = new Date();
        const dateStr = `${date.toLocaleString()}.${String(date.getMilliseconds()).padStart(3, '0')}`;
    if (commonPushCheck() >= 2) {
        console.warn(`${g_FULLNAME}[W] ${dateStr} ${str}`, ...args);
    }
}


/* 点击行为处理 */



/**
 * 点击文档树事件处理
 * @param {*} fn 回调函数
 * @param {*} event 
 * @returns 
 */
export function clickHandler(openActionType, fn, event) {
    if (event.button != 0) {
        debugPush('按下的按键不是左键，终止操作')
        return;
    }
    if (event.ctrlKey || event.shiftKey || event.altKey) {
        debugPush("伴随ctrl/shift/alt按下，终止操作");
        return;
    }
    if (event.metaKey) {
        debugPush("伴随meta按下，终止操作");
        return;
    }
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/tagName DOM tagName为大写
    if (!g_setting.disableChangeIcon && (event.srcElement.classList.contains("b3-list-item__icon") || (["IMG"].includes(event.srcElement.tagName) && event.srcElement.parentElement.classList.contains("b3-list-item__icon")) )) {
        debugPush("点击的是图标，终止操作");
        return;
    }
    if (event.srcElement.classList.contains("b3-list-item__action")) {
        debugPush("列表操作项，不处理", event.srcElement);
        return;
    }
    if (event.srcElement.classList.contains("b3-list-item__toggle") || ["svg", "use"].includes(event.srcElement.tagName)) {
        const sourceElem = getSourceSpanElement(event.srcElement);
        debugPush("判定跳出用", sourceElem);
        if (sourceElem == null) {
            debugPush("sourceElem未找到，未知情况，不处理", event.srcElement);
            return;
        }
        if (sourceElem.classList.contains("b3-list-item__action")) {
            debugPush("列表操作项，不处理", event.srcElement);
            return;
        }
        if (["more-file", "more-root", "new"].includes(sourceElem.getAttribute("data-type"))) {
            debugPush("点击的是更多按钮或新建按钮，终止操作");
            return;
        }
        // 理论上剩下的情况就是toggle
        if (!sourceElem.classList.contains("b3-list-item__toggle")) {
            debugPush("点击的还不是展开按钮，不知道什么情况，终止操作", event.srcElement, sourceElem);
        }
        if (!g_setting.extendClickArea || g_isPluginClickToggle) {
            debugPush("点击的是展开按钮，且不允许响应展开");
            g_isPluginClickToggle = false;
            return;
        }
    }
    if (document.getElementById("commonMenu") && !document.getElementById("commonMenu").classList.contains("fn__none")) {
        debugPush("当前存在commonMeue右键菜单，终止操作");
        return;
    }
    if ([CONSTANTS.ACTION_RAW_CLICK, CONSTANTS.ACTION_TRUE_CLICK].includes(openActionType) && g_isPluginRawClickItem) {
        g_isPluginRawClickItem = false;
        debugPush("由插件执行点击，终止操作");
        return;
    }
    debugPush("event", event);
    
    fn(event)

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    return;  
}




function getSourceSpanElement(elem) {
    // 回溯查找当前位置
    let ftItemElem = elem;
    let isFound = false;
    for (let i = 0; i < 4 && ftItemElem; i++) {
        if (ftItemElem == null) {
            break;
        }
        debugPush("getSourceSpan", ftItemElem, ftItemElem.tagName, ftItemElem.tagName?.toLowerCase() == "span");
        if (ftItemElem.tagName?.toLowerCase() == "span") {
            isFound = true;
            break;
        }
        ftItemElem = ftItemElem.parentNode;
    }
    return isFound ? ftItemElem : null;
}

/* 单双击处理结束 */





/* ************ API 相关 **************** */


export function bindClickDockEvent(removeMode = false) {
    const queryResult = document.querySelectorAll(`.dock span[data-type="tag"], .dock span[data-type="file"], .dock span[data-type="outline"]`);
    const that = this;
    queryResult.forEach((elem)=>{
        if (removeMode) {
            elem.removeEventListener("click", clickDockHandler);
        } else {
            elem.addEventListener("click", clickDockHandler);
        }
    });
}
function clickDockHandler() {
    debugPush("按下侧栏按钮");
    setTimeout(bindBasicEventHandler, 30); 
}


async function request(url, data) {
    let resData = null;
    await fetch(url, {
        body: JSON.stringify(data),
        method: 'POST'
    }).then(function (response) {
        resData = response.json();
    });
    return resData;
}

async function parseBody(response) {
    let r = await response;
    return r.code === 0 ? r.data : null;
}





function isValidStr(s){
    if (s == undefined || s == null || s === '') {
		return false;
	}
	return true;
}

let zh_CN = {
    
}

let en_US = {}
let language = zh_CN;

function isMobile() {
    return window.top.document.getElementById("sidebar") ? true : false;
};
