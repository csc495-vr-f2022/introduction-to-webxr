/* CSC-495 Virtual Reality Introduction to WebXR, Fall 2022
 * Author: Regis Kopper
 *
 * Based on
 * CSC 5619 Lecture 6, Fall 2020
 * Author: Evan Suma Rosenberg
 * 
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3, Color3, Color4 } from "@babylonjs/core/Maths/math";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight" 
import { AssetsManager } from "@babylonjs/core/Misc/assetsManager"
import { PointerEventTypes, PointerInfo } from "@babylonjs/core/Events/pointerEvents";

// Side effects
import "@babylonjs/loaders/glTF/2.0/glTFLoader"
import "@babylonjs/core/Helpers/sceneHelpers";

// Import debug layer
import "@babylonjs/inspector"


// Note: The structure has changed since previous assignments because we need to handle the 
// async methods used for setting up XR. In particular, "createDefaultXRExperienceAsync" 
// needs to load models and create various things.  So, the function returns a promise, 
// which allows you to do other things while it runs.  Because we don't want to continue
// executing until it finishes, we use "await" to wait for the promise to finish. However,
// await can only run inside async functions. https://javascript.info/async-await
class Game 
{ 
    private canvas: HTMLCanvasElement;
    private engine: Engine;
    private scene: Scene;

    constructor()
    {
        this.canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

        this.engine = new Engine(this.canvas, true);

        this.scene = new Scene(this.engine);
    }

    start() : void
    {
        this.createScene().then( () => {
            // Register a render loop to repeatedly render the scene
            this.engine.runRenderLoop(() => { 
                this.scene.render();
            });

            // Watch for browser/canvas resize events
            window.addEventListener("resize", () => { 
                this.engine.resize();
            });            
        })
    }

    private async createScene(){
        // This creates and positions a first-person camera (non-mesh)
        var camera = new UniversalCamera("camera1", new Vector3(0, 1.6, 0), this.scene);
        camera.fov = 90 * Math.PI / 180;

        // This attaches the camera to the canvas
        camera.attachControl(this.canvas, true);

        // Some ambient light to illuminate the scene
        var ambientlight = new HemisphericLight("ambient", Vector3.Up(), this.scene);
        ambientlight.intensity = 1.0;
        ambientlight.diffuse = new Color3(.25, .25, .25);

        // Add a directional light to imitate sunlight
        var directionalLight = new DirectionalLight("sunlight", Vector3.Down(), this.scene);
        directionalLight.intensity = 1.0;

        const environment = this.scene.createDefaultEnvironment({
            createGround: false,

            skyboxSize: 750,

            skyboxColor: new Color3(.059, .663, .80)

        })

        const xrHelper = await this.scene.createDefaultXRExperienceAsync({});

        // this.scene.onPointerObservable.add((pointerInfo) => {
        //     this.processPointer(pointerInfo);
        // })

        var assetsManager = new AssetsManager(this.scene);

        var worldTask = assetsManager.addMeshTask("world tak", "", "assets/models/", "world.glb");

        worldTask.onSuccess = (task) => {
            worldTask.loadedMeshes[0].name = "world";
        }

        // Load all meshes after the tasks are completed
        assetsManager.load();

        assetsManager.onFinish = (task) => {
            this.scene.debugLayer.show();
        }
    }
}
/******* End of the Game class ******/   

var game = new Game();
game.start();