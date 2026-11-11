// loads the 3D engine for books3d.js; kept as its own file so it runs wherever inline scripts are not allowed
import * as THREE from "./three.module.min.js";
window.THREE = THREE;
dispatchEvent(new Event("three-ready"));
