<script lang="ts">
    import {onMount,onDestroy,createEventDispatcher} from "svelte"
    import {Protyle,App,IProtyleOption} from "siyuan"
    export let app:App
    export let iProtyleOption:IProtyleOption
    export let title:string
    export let isExpanded:boolean
    let root:HTMLElement
    let protyle:Protyle
    let dom = document.createElement("div")
    let cacheProtyleOption :IProtyleOption
    const dispatch = createEventDispatcher();

    $:{
        if(JSON.stringify(iProtyleOption) !== JSON.stringify(cacheProtyleOption)){
            cacheProtyleOption = {...iProtyleOption}
            console.log("expend",isExpanded)
            protyle = new Protyle(app,dom,iProtyleOption)
            
        }
    }
    onMount(()=>{
        root.appendChild(dom)
    })
    
    onDestroy(()=>{
        protyle.destroy()
    })
    function toggleExpand(expand?: boolean) {
        isExpanded = expand === undefined ? !isExpanded : expand;
        dispatch('toggle', { id: iProtyleOption.blockId,expand:isExpanded });
    }

    let liSvgClass = "b3-list-item__arrow";
    let ulClass = "fn__none";
    $: {
        console.log("react expend",isExpanded)
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
    <span class="b3-list-item__text">{title}</span>
</li>

<div bind:this={root} class={"block " + ulClass}></div>

<style>
    .block{
        min-height: 200px;
    }
</style>