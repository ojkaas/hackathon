import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import * as THREE from 'three-full';
import { OrbitControls } from '@avatsaev/three-orbitcontrols-ts';

import { RetrieveLoadplanService } from "../services/retrieve-loadplan.service";


@Component({
  selector: 'equipment-visualizer',
  templateUrl: './equipment-visualizer.component.html',
  styleUrls: ['./equipment-visualizer.component.css']
})
export class EquipmentVisualizerComponent implements OnInit {
  @Input() name: string;
  @ViewChild('canvas') canvasRef: ElementRef;

  renderer = new THREE.WebGLRenderer;
  scene = null;
  camera = null;
  controls = null;
  mesh = null;
  light = null;

  @Input()
  public width: any;

  @Input()
  public height: any;


  private calculateAspectRatio(): number {
    const height = this.canvas.clientHeight;
    if (height === 0) {
      return 0;
    }
    return this.canvas.clientWidth / this.canvas.clientHeight;
  }

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  constructor(private retrieveLoadplanService: RetrieveLoadplanService) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, 1200 / 640, 0.1, 1000)
  }

  ngAfterViewInit() {
    this.configScene();
    this.configCamera();
    this.configRenderer();
    this.configControls();

    this.createLight();
    this.createMesh();

    this.animate();
  }

  configScene() {
    this.scene.background = new THREE.Color(0xdddddd);
  }

  configCamera() {
    this.camera.aspect = this.calculateAspectRatio();
    this.camera.updateProjectionMatrix();
    this.camera.position.set(-15, 10, 15);
    this.camera.lookAt(this.scene.position);
  }

  configRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setPixelRatio(devicePixelRatio);
    // setClearColor for transparent background
    // i.e. scene or canvas background shows through
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    console.log('clientWidth', this.canvas.clientWidth);
    console.log('clientHeight', this.canvas.clientHeight);
  }

  configControls() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.autoRotate = false;
    this.controls.enableZoom = true;
    this.controls.enablePan = true;
    this.controls.update();
  }

  createLight() {
    this.light = new THREE.PointLight(0xffffff);
    this.light.position.set(-10, 10, 10);
    this.scene.add(this.light);
  }

  async createMesh() {
    //const geometry = new THREE.BoxGeometry(5, 5, 5);
    //const material = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    //this.mesh = new THREE.Mesh(geometry, material);

    const d = 0.8;

    const boxWidth = 0.5;
    const boxHeight = 0.5;
    const boxDepth = 0.5;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    this.drawTruck(12.023, 2.353, 2.698);
    this.makeInstance(geometry, this.hsl(0 / 8, 1, .5), -d, -d, -d);
    this.makeInstance(geometry, this.hsl(1 / 8, 1, .5), d, -d, -d);
    this.makeInstance(geometry, this.hsl(2 / 8, 1, .5), -d, d, -d);
    this.makeInstance(geometry, this.hsl(3 / 8, 1, .5), d, d, -d);
    this.makeInstance(geometry, this.hsl(4 / 8, 1, .5), -d, -d, d);
    this.makeInstance(geometry, this.hsl(5 / 8, 1, .5), d, -d, d);
    this.makeInstance(geometry, this.hsl(6 / 8, 1, .5), -d, d, d);
    this.makeInstance(geometry, this.hsl(7 / 8, 1, .5), d, d, d);

    let loadplan = await this.retrieveLoadplanService.getPackageArrangementByEquipmentUsage("11111");
 
 
    //this.scene.add(this.mesh);
  }

  public drawTruck(l, w, h) {
    /*
    const loader = new THREE.GLTFLoader();
    const url = 'assets/truck.glb';

    loader.load(url, function(obj) {
      this.scene.add(obj.scene);
    });*/

    const geometry = new THREE.BoxGeometry(l, w, h);
    const color = this.hsl(7 / 8, 1, .5);
    const material = new THREE.MeshPhongMaterial({ color, wireframe: true });


    const cube = new THREE.Mesh(geometry, material);
    this.scene.add(cube);

    cube.position.set(0, 0, 0);
  }

  animate() {
    window.requestAnimationFrame(() => this.animate());
    // this.mesh.rotation.x += 0.01;
    // this.mesh.rotation.y += 0.01;

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  private makeInstance(geometry, color, x, y, z) {

    const material = new THREE.MeshPhongMaterial({ color, transparent: true, opacity: 1, premultipliedAlpha: true });


    const cube = new THREE.Mesh(geometry, material);
    this.scene.add(cube);

    cube.position.set(x, y, z);

    return cube;
  }

  public hsl(h, s, l) {
    return (new THREE.Color()).setHSL(h, s, l);
  }
}