<script lang="ts">
    import {onMount,onDestroy,createEventDispatcher} from "svelte"
    import {Protyle,App,IProtyleOption} from "siyuan"
    export let app:App
    export let iProtyleOption:IProtyleOption
    export let title:string
    export let isExpanded:boolean
    export let initHeight:number = 230
    export let initWidth:number = 300
    let root:HTMLElement
    let protyle:Protyle
    let dom = document.createElement("div")
    let cacheProtyleOption :IProtyleOption
    const dispatch = createEventDispatcher();
    let sizeObserver:ResizeObserver

    $:{
        if(JSON.stringify(iProtyleOption) !== JSON.stringify(cacheProtyleOption)){
            cacheProtyleOption = {...iProtyleOption}
            // console.log("expend",isExpanded)
            protyle = new Protyle(app,dom,iProtyleOption)

        }
    }


    onMount(()=>{
        root.appendChild(dom)
        let rootWidth = root.getClientRects()[0].width
        let scale = rootWidth / initWidth
        initHeight = initHeight / scale
        sizeObserver = new ResizeObserver(()=>{
            let domRect = root?.getClientRects()
            if (!domRect || domRect.length == 0){
                return
            }
            updateCache()
        })
        sizeObserver.observe(dom)
    })
    
    onDestroy(()=>{
        protyle.destroy()

    })
    function updateCache(){
        let currentWidth:number
        let currentHeight:number
        let domRect = dom?.getClientRects()
        if (!domRect || domRect.length == 0){
            return
        }else{
            currentHeight = domRect[0].height
            currentWidth = domRect[0].width
            if (currentHeight < 230){
                return
            }
        }

        dispatch("cacheSize",{
            id:iProtyleOption.blockId,
            height:currentHeight,
            width:currentWidth
        })
    }
    function toggleExpand(expand?: boolean) {
        isExpanded = expand === undefined ? !isExpanded : expand;
        dispatch('toggle', { id: iProtyleOption.blockId,expand:isExpanded });
    }

    let liSvgClass = "b3-list-item__arrow";
    let ulClass = "fn__none";
    $: {
        // console.log("react expend",isExpanded)
        if (isExpanded) {
            liSvgClass = "b3-list-item__arrow b3-list-item__arrow--open";
            ulClass = "";
        } else {
            liSvgClass = "b3-list-item__arrow";
            ulClass = "fn__none";
        }
    }


</script>

<li
    class="b3-list-item b3-list-item--hide-action workflow-title"
    data-treetype="bookmark"
    data-type="undefined"
    data-subtype="undefined"
    on:click={() => toggleExpand()}
    on:keydown={() => {}}
>
    <span
        style="padding-left: 4px;margin-right: 2px"
        class="b3-list-item__toggle b3-list-item__toggle--hl"
    >
        <svg data-id="Doing0" class={liSvgClass}
            ><use xlink:href="#iconRight" /></svg
        >
    </span>
    <span class="b3-list-item__text">{iProtyleOption.blockId}:{title}</span>
</li>

<div bind:this={root} class={"block " + ulClass} style={`min-height:${initHeight}px`}></div>

<style>
    .block{
        /* height: 230px; */
    }
</style>