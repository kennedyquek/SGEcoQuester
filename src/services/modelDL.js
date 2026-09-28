// import buffer
import { Buffer } from "buffer";

// function to download model resource
export async function downloadMResource(fetchFn, url, options = {},timeoutMs=30000) {

    // create controller
    const ctrller = new AbortController();

    // start with no timeout
    let timedOut = false;

    // after timeout limit, record a timeout
    const timer = setTimeout(()=>{timedOut=true;ctrller.abort();},timeoutMs);

    // let callers cancellation stop request
    const cancel = () => ctrller.abort();

    // stop immediately if caller has already canccelled
    if (options.signal?.aborted) cancel();

    // else listen for cancellation once
    else options.signal?.addEventListener("abort",cancel,{once:true});

    // try block
    try{

        // keep options but use our signal to support timeout\
        const resp = await fetchFn(url,{...options,signal:ctrller.signal});

        // if unsuccessful response, throw error
        if(!resp.ok) throw new Error(`Model download failed.(HTTP ${resp.status})`);

        // wait for all downloaded bytes
        const downloadedBytes = await resp.arrayBuffer();

        // mark success and keep data
        return {ok: true, status:resp.status, headers:resp.headers, url:resp.url,
             json: async () => JSON.parse(Buffer.from(downloadedBytes).toString("utf8")),
            arrayBuffer: async ()=> downloadedBytes
        };

    // catch error
    } catch(error) {

        // give timeout failure helpful message
        if(timedOut) throw new Error("Model Download timed out.");

        // pass error back to calling function
        throw error;
    
    // finally
    }finally{

        // clear timeout
        clearTimeout(timer);

        // remove cancellation event listener
        options.signal?.removeEventListener("abort",cancel);

    }


}