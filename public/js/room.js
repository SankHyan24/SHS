'use strict';
import * as THREE from 'three';
// import getItems from './roominfo.js';
import Stats from 'three/addons/libs/stats.module.js';
import { saveItems, updateItems } from './roominfo.js';
// todo:
//  add new cube type(light, door, window, etc.)
//  add a control panel to control the type information
//      learn from this: https://github.com/mrdoob/three.js/blob/master/examples/webgl_camera_cinematic.html
//  add the data get and render part
//  add the data save part


// todo: 2.0
//  先把方块替换成其他实体（按钮等）
//  添加从后端获取数据的功能。并初始化到场景中
//  添加保存数据的功能
// 添加控制面板，控制物体的类型
var items_type_mapper = {
    "Light": 0,
    "Switch": 1,
    "Sensor": 2,
    "Lock": 3
};
var items_type_mapper_cn = ["灯", "开关", "传感器", "密码锁"];

let camera, scene, renderer, stats, container;
let plane;
let pointer, raycaster, isShiftDown = false;

let turnL = false, turnR = false, trunCloser = false, turnFarther = false, turnRotate = false, turnInRotate = false;

let rollOverMesh, rollOverMaterial;
let cubeGeo, cubeMaterial;

const objects = [];
const new_objs = [];// contains all the new objects in the scene
const old_deleted_objs_index = [];// contains all the saved object indices to be deleted in the scene
const obj_list = [];// contains all the objects in the scene
var textures = [];
var counter_0 = 0;

// visualization part
var edit_mode = false;
var choose_hid = -1;

// end

init();
render();

function init() {
    //
    container = document.createElement('div');
    // set id for the container
    container.id = "3d_container";
    stats = new Stats();
    container.appendChild(stats.dom);
    //

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(700, 700, 700);
    camera.lookAt(0, 0, 0);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xfeb74c, map: new THREE.TextureLoader().load('assets/texture/blocks.png'), side: THREE.DoubleSide });
    // 纹理分割成11个小块，分别分配给不同的材质

    // roll-over helpers
    for (let i = 0; i < 11; i++) {
        textures[i] = new THREE.MeshLambertMaterial({ color: 0xfeb74c, map: new THREE.TextureLoader().load('assets/texture/blocks.png') });
        textures[i].map.magFilter = THREE.NearestFilter;
        textures[i].map.repeat.set(1, 1.0 / 11);
        textures[i].map.offset.set(0, 1.0 * i / 11);
    }
    const rollOverGeo = new THREE.BoxGeometry(50, 50, 50);
    rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true });
    rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
    scene.add(rollOverMesh);

    // cubes

    cubeGeo = new THREE.BoxGeometry(50, 50, 50);
    // 使用纹理映射


    // 在这里获取服务器传来的数据，然后渲染到场景中。主要是物体的信息
    //
    //


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
    renderer.setSize(parent.innerWidth, window.innerHeight * 0.96);
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

function updateWindow(x, y, z) {
    document.getElementById("x").innerHTML = x;
    document.getElementById("y").innerHTML = y;
    document.getElementById("z").innerHTML = z;
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

        updateWindow(intersect.object.position.x, intersect.object.position.y, intersect.object.position.z);
    }
}

function onPointerDown(event) {
    if (edit_mode == true) {
        setting_mode_onPointerDown();
        return;
    }
    pointer.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(objects, false);

    if (intersects.length > 0) {

        const intersect = intersects[0];

        // delete cube
        if (isShiftDown) {
            if (intersect.object !== plane) {
                console.log("deleting object");
                scene.remove(intersect.object);
                objects.splice(objects.indexOf(intersect.object), 1);
                const db_obj = {
                    x: parseInt((intersect.object.position.x / 25 - 1) / 2),
                    y: parseInt((intersect.object.position.y / 25 - 1) / 2),
                    z: parseInt((intersect.object.position.z / 25 - 1) / 2)
                }
                // if the obj is not in the new_objs, 
                // push it to old_deleted_objs_index
                // if in the new_objs, delete it from new_objs
                let flag = 0;
                for (let i = 0; i < new_objs.length; i++)
                    if (new_objs[i].x == db_obj.x && new_objs[i].y == db_obj.y && new_objs[i].z == db_obj.z) {
                        flag = 1;
                        console.log("deleting new object");
                        new_objs.splice(i, 1);
                    }
                if (flag == 0) {
                    let id = 0;
                    for (let i = 0; i < obj_list.length; i++)
                        if (obj_list[i].x == db_obj.x && obj_list[i].y == db_obj.y && obj_list[i].z == db_obj.z) {
                            id = obj_list[i].id;
                            old_deleted_objs_index.push(id);
                            console.log("deleting old object");
                        }
                }
            }

            // create cube

        } else {

            console.log("creating object");
            // if in the old_deleted_objs, delete it from old_deleted_objs and push it to obj_list
            const db_obj = {
                x: parseInt((parseInt(intersect.point.x) / 25 - 1) / 2),
                y: parseInt((parseInt(intersect.point.y) / 25 - 1) / 2),
                z: parseInt((parseInt(intersect.point.z) / 25 - 1) / 2),
            }
            // const db_obj = {
            //     x: parseInt((intersect.object.position.x / 25 - 1) / 2),
            //     y: parseInt((intersect.object.position.y / 25 - 1) / 2),
            //     z: parseInt((intersect.object.position.z / 25 - 1) / 2),
            // }
            let flag = 0, reuse_id;// if in the obj_list
            for (let i = 0; i < obj_list.length; i++)
                if (obj_list[i].x == db_obj.x && obj_list[i].y == db_obj.y && obj_list[i].z == db_obj.z) {
                    reuse_id = obj_list[i].id;
                    console.log("found it can be reused");
                    for (let j = 0; j < old_deleted_objs_index.length; j++)
                        if (old_deleted_objs_index[j] == reuse_id) {
                            console.log("bingo");
                            console.log(reuse_id);
                            flag = 1;
                            old_deleted_objs_index.splice(j, 1);
                            const voxel = new THREE.Mesh(cubeGeo, textures[counter_0]);
                            voxel.position.copy({
                                x: db_obj.x * 50 + 25,
                                y: db_obj.y * 50 + 25,
                                z: db_obj.z * 50 + 25
                            }).add(intersect.face.normal);
                            voxel.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
                            scene.add(voxel);
                            objects.push(voxel);// 管理所有的物体（3D层面）
                            console.log("reuse old object");
                            break;
                        }
                }
            if (db_obj.x == 0 && db_obj.y == 0 && db_obj.z == 0)
                flag = 0;
            if (flag) {

            } else {
                const voxel = new THREE.Mesh(cubeGeo, textures[counter_0]);
                voxel.position.copy(intersect.point).add(intersect.face.normal);
                voxel.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
                scene.add(voxel);
                objects.push(voxel);// 管理所有的物体（3D层面）
                console.log("creat new object");
                const obj = {
                    x: parseInt((voxel.position.x / 25 - 1) / 2),
                    y: parseInt((voxel.position.y / 25 - 1) / 2),
                    z: parseInt((voxel.position.z / 25 - 1) / 2),
                    type: counter_0
                }
                console.log(obj);
                new_objs.push(obj);// 存储新添加的物品（数据库层面）
            }
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


export default function render_items(items_data) {
    console.log("items is:");
    console.log(items_data);
    for (let i = 0; i < items_data.length; i++) {
        const voxel = new THREE.Mesh(cubeGeo, textures[items_data[i].type]);
        voxel.position.x = (items_data[i].axis_x + 0.5) * 50;
        voxel.position.y = (items_data[i].axis_y + 0.5) * 50;
        voxel.position.z = (items_data[i].axis_z + 0.5) * 50;
        const obj = {
            id: items_data[i].id,
            x: parseInt((voxel.position.x / 25 - 1) / 2),
            y: parseInt((voxel.position.y / 25 - 1) / 2),
            z: parseInt((voxel.position.z / 25 - 1) / 2),
            type: items_data[i].type,
            is_open: items_data[i].is_open,
            brightness: items_data[i].brightness,
            temperature: items_data[i].temperature,
            humidity: items_data[i].humidity,
            lock_passwd: items_data[i].lock_passwd,

            // 在这里添加更多设备信息
        }
        scene.add(voxel);
        objects.push(voxel);
        obj_list.push(obj);
    }
}

function render() {
    renderer.render(scene, camera);
}

const save_btn = document.querySelector('.save-btn');
const edit_mode_btn = document.querySelector('.mode-btn');
save_btn.onclick = () => {
    console.log("save");
    console.log(new_objs);
    console.log(old_deleted_objs_index);
    saveItems(new_objs, old_deleted_objs_index);
    objects.length = 0;
    new_objs.length = 0;
    old_deleted_objs_index.length = 0;
    location.href = "/house";
}

edit_mode_btn.onclick = () => {
    console.log("change mode");
    if (edit_mode) {
        edit_mode = false;
        edit_mode_btn.innerHTML = "进入浏览模式";
        $(".param_padle").css("display", "none");
    }
    else {
        edit_mode = true;
        edit_mode_btn.innerHTML = "进入编辑模式";
        $(".param_padle").css("display", "block");
    }
}


// setting mode
function setting_mode_onPointerDown() {
    pointer.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(objects, false);

    if (intersects.length > 0) {

        const intersect = intersects[0];

        // delete cube
        if (intersect.object !== plane) {
            // get hid of the cube
            const db_obj = {
                x: parseInt((intersect.object.position.x / 25 - 1) / 2),
                y: parseInt((intersect.object.position.y / 25 - 1) / 2),
                z: parseInt((intersect.object.position.z / 25 - 1) / 2)
            }
            console.log(db_obj);
            const index = obj_list.findIndex((obj) => {
                return obj.x == db_obj.x && obj.y == db_obj.y && obj.z == db_obj.z;
            });
            if (index != -1) {
                choose_hid = obj_list[index].id;
            }
            else {
                choose_hid = -1;
            }
        }
        update_param_paddle();
        render();
    }
}

function update_param_paddle() {
    let hid = choose_hid;
    // choose hid from the items_data
    if (hid == -1)
        return;
    let index = obj_list.findIndex((obj) => {
        return obj.id == hid;
    }
    );
    if (index == -1)
        return;
    let obj = obj_list[index];
    let type = obj.type;
    const type_hd = document.querySelector('#room_param_type');
    // use items_type_mapper
    let type_str = "请选择一个设备";
    console.log(type);
    if (type < 4)
        type_str = items_type_mapper_cn[type];
    type_hd.innerHTML = "种类： " + type_str;

    $(".param_btn").css('display', 'block');
    switch (type) {
        case 0: {
            $(".param_type_0").css('display', 'block');
            $(".param_type_1").css('display', 'none');
            $(".param_type_2").css('display', 'none');
            $(".param_type_3").css('display', 'none');
            const is_open_hd = document.querySelector('#param_0_is_open');
            is_open_hd.value = obj.is_open;
            const brightness_hd = document.querySelector('#param_0_brightness');
            brightness_hd.value = obj.brightness;
            break;
        }
        case 1: {
            $(".param_type_0").css('display', 'none');
            $(".param_type_1").css('display', 'block');
            $(".param_type_2").css('display', 'none');
            $(".param_type_3").css('display', 'none');
            const is_open_hd = document.querySelector('#param_1_is_open');
            is_open_hd.value = obj.is_open;
            break;
        }
        case 2: {
            $(".param_type_0").css('display', 'none');
            $(".param_type_1").css('display', 'none');
            $(".param_type_2").css('display', 'block');
            $(".param_type_3").css('display', 'none');
            const temperature_hd = document.querySelector('#param_2_temperature');
            temperature_hd.value = obj.temperature;
            const humidity_hd = document.querySelector('#param_2_humidity');
            humidity_hd.value = obj.humidity;
            break;
        }
        case 3: {
            $(".param_type_0").css('display', 'none');
            $(".param_type_1").css('display', 'none');
            $(".param_type_2").css('display', 'none');
            $(".param_type_3").css('display', 'block');
            const is_open_hd = document.querySelector('#param_3_is_open');
            is_open_hd.value = obj.is_open
            const lock_passwd_hd = document.querySelector('#param_3_lock_passwd');
            lock_passwd_hd.value = obj.lock_passwd;
            break;
        }
        default: $(".param_type_0").css('display', 'none');
            $(".param_type_1").css('display', 'none');
            $(".param_type_2").css('display', 'none');
            $(".param_type_3").css('display', 'none');
            $(".param_btn").css('display', 'none');
            break;
    }
}

const param_submit_btn = document.querySelector('.param_btn');
param_submit_btn.onclick = () => {
    let hid = choose_hid;
    if (hid == -1)
        return;
    let index = obj_list.findIndex((obj) => {
        return obj.id == hid;
    }
    );
    if (index == -1)
        return;
    let obj = obj_list[index];
    let obj_type = obj.type;
    var is_open_hd = null;
    var brightness_hd = null;
    var temperature_hd = null;
    var humidity_hd = null;
    var lock_passwd_hd = null;
    switch (obj_type) {
        case 0: {
            is_open_hd = document.querySelector('#param_0_is_open');
            brightness_hd = document.querySelector('#param_0_brightness');
            break;
        }
        case 1: {
            is_open_hd = document.querySelector('#param_1_is_open');
            break;
        }
        case 2: {
            temperature_hd = document.querySelector('#param_2_temperature');
            humidity_hd = document.querySelector('#param_2_humidity');
            break;
        }
        case 3: {
            is_open_hd = document.querySelector('#param_3_is_open');
            lock_passwd_hd = document.querySelector('#param_3_lock_passwd');
            break;
        }
        default: $(".param_type_0").css('display', 'none');
            $(".param_type_1").css('display', 'none');
            $(".param_type_2").css('display', 'none');
            $(".param_type_3").css('display', 'none');
            $(".param_btn").css('display', 'none');
            break;
    }
    let item_is_open = is_open_hd == null ? null : is_open_hd.value;
    let item_brightness = brightness_hd == null ? null : brightness_hd.value;
    let item_temperature = temperature_hd == null ? null : temperature_hd.value;
    let item_humidity = humidity_hd == null ? null : humidity_hd.value;
    let item_lock_passwd = lock_passwd_hd == null ? null : lock_passwd_hd.value;
    let item_tobe_updated = {
        id: hid,
        type: obj_type,
        axis_x: obj.axis_x,
        axis_y: obj.axis_y,
        axis_z: obj.axis_z,
        is_open: item_is_open,
        brightness: item_brightness,
        temperature: item_temperature,
        humidity: item_humidity,
        lock_passwd: item_lock_passwd
    }
    console.log(item_tobe_updated);
    updateItems(item_tobe_updated);
}