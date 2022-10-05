import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';




let camera, scene, renderer, stats, container;
let plane;
let pointer, raycaster, isShiftDown = false;

let turnL = false, turnR = false, trunCloser = false, turnFarther = false, turnRotate = false, turnInRotate = false;

let rollOverMesh, rollOverMaterial;
let cubeGeo, cubeMaterial;

const objects = [];
const obj_lists = [];
var textures = [];
var counter_0 = 0;

init();
render();

function init() {
    //
    container = document.createElement('div');
    stats = new Stats();
    container.appendChild(stats.dom);
    //

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(700, 700, 700);
    camera.lookAt(0, 0, 0);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // roll-over helpers

    const rollOverGeo = new THREE.BoxGeometry(50, 50, 50);
    rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true });
    rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
    scene.add(rollOverMesh);

    // cubes

    cubeGeo = new THREE.BoxGeometry(50, 50, 50);
    // 使用纹理映射

    // cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xfeb74c, map: new THREE.TextureLoader().load('assets/texture/blocks.png'), side: THREE.DoubleSide });
    // 纹理分割成11个小块，分别分配给不同的材质
    for (let i = 0; i < 11; i++) {
        textures[i] = new THREE.MeshLambertMaterial({ color: 0xfeb74c, map: new THREE.TextureLoader().load('assets/texture/blocks.png') });
        textures[i].map.magFilter = THREE.NearestFilter;
        textures[i].map.repeat.set(1, 1.0 / 11);
        textures[i].map.offset.set(0, 1.0 * i / 11);
    }


    // grid
    // 1000 is the size of the grid, 20 is the number of lines
    const gridHelper = new THREE.GridHelper(1000, 20);
    scene.add(gridHelper);

    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();

    const geometry = new THREE.PlaneGeometry(1000, 1000);
    geometry.rotateX(- Math.PI / 2);

    plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ visible: false }));
    scene.add(plane);

    objects.push(plane);

    // lights

    const ambientLight = new THREE.AmbientLight(0x606060);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(1, 0.75, 0.5).normalize();
    scene.add(directionalLight);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onDocumentKeyDown);
    document.addEventListener('keyup', onDocumentKeyUp);

    //

    window.addEventListener('resize', onWindowResize);

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    render();

}

function onPointerMove(event) {

    pointer.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(objects, false);

    if (intersects.length > 0) {

        const intersect = intersects[0];

        rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
        rollOverMesh.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);

        render();

    }

}

function onPointerDown(event) {

    pointer.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(objects, false);

    if (intersects.length > 0) {

        const intersect = intersects[0];

        // delete cube

        if (isShiftDown) {

            if (intersect.object !== plane) {

                scene.remove(intersect.object);

                objects.splice(objects.indexOf(intersect.object), 1);

            }

            // create cube

        } else {
            const voxel = new THREE.Mesh(cubeGeo, textures[counter_0]);
            voxel.position.copy(intersect.point).add(intersect.face.normal);
            voxel.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
            scene.add(voxel);
            const obj = {
                x: voxel.position.x,
                y: voxel.position.y,
                z: voxel.position.z,
                type: counter_0
            }
            objects.push(voxel);
            obj_lists.push(obj);
        }

        render();

    }

}

function onDocumentKeyDown(event) {
    switch (event.keyCode) {

        case 16: isShiftDown = true; break;
        case 65: turnL = true; break;
        case 68: turnR = true; break;
        case 81: trunCloser = true; break;
        case 69: turnFarther = true; break;
        case 90: turnRotate = true; break;
        case 67: turnInRotate = true; break;
    }
    let posx = camera.position.x;
    let posz = camera.position.z;
    let posy = camera.position.y;
    // // 球心矫正
    // let juli = Math.sqrt(posx * posx + posz * posz + posy * posy);
    // camera.position.normalize();
    // camera.position.multiplyScalar(juli);



    if (turnL) {
        camera.position.x = posx * Math.cos(0.01) - posz * Math.sin(0.01);
        camera.position.z = posx * Math.sin(0.01) + posz * Math.cos(0.01);
    }

    if (turnR) {
        camera.position.x = posx * Math.cos(-0.01) - posz * Math.sin(-0.01);
        camera.position.z = posx * Math.sin(-0.01) + posz * Math.cos(-0.01);
    }

    if (trunCloser) {
        camera.position.x *= 0.91;
        camera.position.z *= 0.91;
        camera.position.y *= 0.91;
    }

    if (turnFarther) {
        camera.position.x *= 1.1;
        camera.position.z *= 1.1;
        camera.position.y *= 1.1;
    }

    // if (turnRotate || turnInRotate) {
    //     let axis = new THREE.Vector3(0, 0, 0);
    //     axis.y = 0;
    //     axis.x = posz;
    //     axis.z = -posx;
    //     axis.normalize();
    //     if (turnRotate)
    //         camera.position.applyAxisAngle(axis, 0.01);
    //     else {
    //         camera.position.applyAxisAngle(axis, -0.01);
    //     }
    // }

    camera.lookAt(0, 0, 0);
    render();
}

function onDocumentKeyUp(event) {
    switch (event.keyCode) {
        case 16: isShiftDown = false; break;
        case 65: turnL = false; break;
        case 68: turnR = false; break;
        // press s
        case 83:
            counter_0++;
            counter_0 %= 11;
            break;
        case 87:
            counter_0--;
            counter_0 += 11;
            counter_0 %= 11;
            break;
        case 81: trunCloser = false; break;// press q
        case 69: turnFarther = false; break;// press e
        // press z
        case 90:
            turnRotate = false;
            break;
    }
}

function render() {
    renderer.render(scene, camera);
}