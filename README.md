# Access Razer Chroma RESTful API from Node.js / browsers

This library can be used to interact with the RESTful API of the [Razer Chroma SDK](https://assets.razerzone.com/dev_portal/REST/html/index.html).


## Usage

```javascript
import { RazerChromaSDK, Category, Device } from "razer-chroma-sdk";

(async () => {

    const sdk = await RazerChromaSDK.initialize({
        title: "My kewl game",
        description: "My game is really kewl. You should try it.",
        author: {
            name: "ACME Inc.",
            contact: "http://example.com/"
        },
        device_supported: [ Device.MOUSE, Device.KEYBOARD ],
        category: Category.GAME
    });

    // Yay! Now let's do some fancy stuff.
    // ...

    // Don't forget to un-initialize the SDK after using it, to free up resources.
    await sdk.uninitialize();

})();
```
