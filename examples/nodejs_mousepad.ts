#!/usr/bin/env node-ts

import {RazerChromaSDK, Device, Category, Effect, Color} from "../src/";

async function sleep(ms: number): Promise<void> {
    console.log(`Sleeping for ${ms} milliseconds.`)
    return new Promise<void>(resolve => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

(async () => {
   const sdk = await RazerChromaSDK.initialize({
        category: Category.GAME,
        title: "Friendly Fire",
        description: "Explore the world of Friendly Fire - x",
        author: {
            name: "The Cat Hive Developers",
            contact: "https://www.friendlyfiregame.com/"
        },
        device_supported: [
            Device.MOUSE
        ]
    });

    console.log(`Chroma SDK initialized. URI: "${sdk.uri}", Session ID: "${sdk.sessionId}"`);
    console.log(`Supported devices: ${Array.from(sdk.devices.supported)}`)

    const versionInfo = await RazerChromaSDK.getVersionInfo();
    console.log(`Razer Chroma SDK version detected: core: "${versionInfo.core}", device: "${versionInfo.device}", version: "${versionInfo.version}"`)

    try {

        const fxNone = await sdk.effects.create(Device.MOUSE, {
            effect: Effect.NONE
        });
        await sdk.effects.set(fxNone);
        console.log(`Effect NONE created and set (${fxNone}).`);

        const fxEffect = await sdk.effects.create(Device.MOUSE, {
            effect: Effect.STATIC,
            param: {
                color: Color.BLUE
            }
        });
        await sdk.effects.set(fxEffect);
        console.log(`Effect created and set: ${fxEffect}`);

        await sleep(20000);

    } catch (e) {
        console.log("Main program failed. :-(");
        console.log(e);
    } finally {
        console.log("Un-initializing SDK.");
        await sdk.uninitialize();
    }

})();
