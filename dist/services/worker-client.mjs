// One-shot request/progress protocol shared by all curriculum instances.
export async function workerRequest(type,assets,extra={},progress){
 if(!('serviceWorker'in navigator))throw Error('unsupported');
 const reg=await Promise.race([navigator.serviceWorker.ready,new Promise((_,reject)=>setTimeout(()=>reject(Error('timeout')),12000))]);
 const worker=navigator.serviceWorker.controller||reg.active;if(!worker)throw Error('worker');
 return new Promise((resolve,reject)=>{const channel=new MessageChannel();let timer;const reset=()=>{clearTimeout(timer);timer=setTimeout(()=>{channel.port1.close();reject(Error('timeout'));},45000);};reset();channel.port1.onmessage=({data})=>{reset();if(data.progress!=null){progress?.(data);return;}clearTimeout(timer);channel.port1.close();data.ok?resolve(data):reject(Error(data.reason||'network'));};worker.postMessage({type,assets,...extra},[channel.port2]);});
}
