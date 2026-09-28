// import node test
import test from "node:test";

// import node assert
import assert from "node:assert/strict";

// import downloader from modelDL.js
import { downloadMResource } from "../src/services/modelDL.js";

// test that downloaded bytes can be read as JSON or raw data
test("Downloaded resource can be read as JSON or bytes.",async ()=>{

    // pass fake arguments into downloader
    const fakeResult = await downloadMResource(async () => new Response('{"name":"model"}'),"test",{},100);

    // compare decoded JSON with expected object
    assert.deepEqual(await fakeResult.json(),{name:"model"});

    // compare downloaded bytes turned to text with original JSON
    assert.equal(Buffer.from(await fakeResult.arrayBuffer()).toString(), '{"name":"model"}');

});

// test unsuccessful server response reported as error
test("Unsuccessful server reported.",async ()=> {

    // test that fake status is reported
    await assert.rejects(downloadMResource(async () => new Response("error",{status:503}),"test"), /HTTP 503/);

});

// check timeout sends cancellation signal to fake request
test("Stalled connection receives an abort." , async () => {

    // signal
    let sig;

    // stalled connection
    const stalledConn = (_url,options) => new Promise((_resolve, reject)=>{

        // read cancellation signal passed by downloader
        sig = options.signal;

        // reject on cancellation
        sig.addEventListener("abort",()=> reject(new Error("aborted")),{once:true});

    })

    // give fake request 10ms and expect timeout error
    await assert.rejects(downloadMResource(stalledConn, "test",{},10),/timed out/);

    //  expect signal to be aborted
    assert.equal(sig.aborted,true);


});

// test timeout for download
test("Download stops if it takes too long.",async () => {

    // fake successful headers but stalled download
    const stalledDownload = async (_url,options) => ({ ok:true,status:200,

        // reject unfinished bytes;listen once
        arrayBuffer: () => new Promise((_resolve,reject) => options.signal.addEventListener("abort",()=> reject(new Error("aborted")),{once:true}))

    });

    // check that downloader fails with a 10ms timeout limit, and fails with the words "timed out"
    await assert.rejects(downloadMResource(stalledDownload,"test",{},10), /timed out/);

});