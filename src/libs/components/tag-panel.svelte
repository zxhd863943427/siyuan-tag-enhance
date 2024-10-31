<script lang="ts">
    import VirtualList  from "@sveltejs/svelte-virtual-list";


    import SvelteBlock from "@/libs/components/svelte-block.svelte";
    import {App,IProtyleOption} from "siyuan"
    import { sql as query } from "@/api";
    export let app:App
    export let tag:string
    let data: {block:Block,expand:boolean}[] = []
    let root:HTMLElement
    let cacheSize:Map<string,[number,number]> = new Map()
    let initTagList = async (tag:string)=>{
        if (tag==""){
            return
        }

        let vitrualContents = root.querySelector("svelte-virtual-list-viewport")
        vitrualContents.scrollTo(0,0)
        let sql = `
        SELECT * FROM blocks WHERE id in (
          SELECT 
            CASE 
              WHEN tag == REPLACE(TRIM(markdown), CHAR(0x200B), '') AND parent_id != "" THEN parent_id
              ELSE id
            END AS id
          FROM blocks WHERE id in (
            SELECT id FROM blocks_fts WHERE blocks_fts MATCH '{tag}:"#${tag}#" OR "#${tag}/"*'
          )
            AND type not in ("i","l","s","b")
        )
        `;
        data = (await query(sql)).map(i=>{return {block:i,expand:true}});
        // console.log(data)
    }
    $:initTagList(tag)
    function geniProtyleOption(b:Block):IProtyleOption{
      if (b.type == "d"){
        return {
          blockId:b.id,
          render:{
            title:true,
            background:true
          }
        }
      }
      else{
        return {blockId:b.id}
      }
    }
    function toggleHandle(event){
      data.forEach(i=>{
        if (i.block.id == event.detail.id){
          i.expand = event.detail.expand
        }
      })
    }

    function setCacheSize(event:any){
      cacheSize.set(event.detail.id,[event.detail.height,event.detail.width]) 
    }
    function getCacheHeight(id:string){
      let cache = cacheSize.get(id) || [230,300]
      return cache[0]
    }
    function getCacheWidth(id:string){
      let cache = cacheSize.get(id) || [230,300]
      return cache[1]
    }
</script>

<div bind:this={root} style="height: 100%;">
  <VirtualList items={data} let:item>

    <SvelteBlock 
      app={app} 
      iProtyleOption={geniProtyleOption(item.block)} 
      title = {item.block.hpath} 
      isExpanded={item.expand} 
      initHeight={getCacheHeight(item.block.id)}
      initWidth={getCacheWidth(item.block.id)}
      on:toggle={toggleHandle}
      on:cacheSize={setCacheSize}>
    </SvelteBlock>
     
  </VirtualList>
</div>


