// Each app context owns its resource cache. Failed requests remain retryable.
export function createResourceRepository(pack,{version='',fetcher=globalThis.fetch}={}){
 let index,indexRequest,sheets,sheetRequest;
 const read=async url=>{const response=await fetcher(url);if(!response.ok)throw Error('resources');return response.json();};
 return {
  peek:()=>index,
  async load(){if(index)return index;if(!indexRequest)indexRequest=read(pack.resources+(pack.resources.includes('?')?'&':'?')+'v='+encodeURIComponent(version)).then(data=>index=data).finally(()=>{indexRequest=undefined;});return indexRequest;},
  async worksheets(){if(sheets)return sheets;if(!sheetRequest)sheetRequest=read(pack.worksheets).then(data=>sheets=data).finally(()=>{sheetRequest=undefined;});return sheetRequest;}
 };
}
