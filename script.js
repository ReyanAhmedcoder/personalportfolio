import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js";

const loader = document.querySelector("#loader");
window.addEventListener("load", () => setTimeout(() => loader.classList.add("done"), 1000));

const themeToggle = document.querySelector(".theme-toggle");
const savedTheme = localStorage.getItem("portfolio-theme");
if (savedTheme === "light") document.body.dataset.theme = "light";

function updateThemeControl() {
  const isLight = document.body.dataset.theme === "light";
  themeToggle.setAttribute("aria-label", `Switch to ${isLight ? "dark" : "light"} mode`);
  themeToggle.setAttribute("title", `Switch to ${isLight ? "dark" : "light"} mode`);
  themeToggle.setAttribute("aria-pressed", String(isLight));
  themeToggle.textContent = isLight ? "☾" : "☼";
}

updateThemeControl();
themeToggle.addEventListener("click", () => {
  const nextTheme = document.body.dataset.theme === "light" ? "dark" : "light";
  document.body.dataset.theme = nextTheme;
  localStorage.setItem("portfolio-theme", nextTheme);
  updateThemeControl();
});

const canvas = document.querySelector("#webgl");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(65, innerWidth/innerHeight, .1, 100);
camera.position.z = 6;

const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const group = new THREE.Group();
scene.add(group);

const count = 1500;
const positions = new Float32Array(count*3);
const sizes = new Float32Array(count);
for(let i=0;i<count;i++){
  const r = 3.5 + Math.random()*5;
  const a = Math.random()*Math.PI*2;
  const b = Math.acos(2*Math.random()-1);
  positions[i*3] = r*Math.sin(b)*Math.cos(a);
  positions[i*3+1] = r*Math.cos(b);
  positions[i*3+2] = r*Math.sin(b)*Math.sin(a);
  sizes[i] = Math.random();
}
const geo = new THREE.BufferGeometry();
geo.setAttribute("position", new THREE.BufferAttribute(positions,3));
geo.setAttribute("aSize", new THREE.BufferAttribute(sizes,1));
const mat = new THREE.PointsMaterial({color:0xff6a4a,size:.025,transparent:true,opacity:.65,blending:THREE.AdditiveBlending});
const stars = new THREE.Points(geo,mat);
group.add(stars);

const knot = new THREE.Mesh(
  new THREE.TorusKnotGeometry(1.15,.025,220,12,2,3),
  new THREE.MeshBasicMaterial({color:0xff5531,wireframe:true,transparent:true,opacity:.22})
);
knot.position.set(2.5,.2,-1.8);
group.add(knot);

const ring = new THREE.Mesh(
  new THREE.TorusGeometry(1.7,.008,16,160),
  new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.14})
);
ring.rotation.x = Math.PI/2.4;
ring.position.set(2.5,.2,-2);
group.add(ring);

let mx=0,my=0,tx=0,ty=0;
addEventListener("pointermove",e=>{
  mx=(e.clientX/innerWidth-.5);
  my=(e.clientY/innerHeight-.5);
  const glow=document.querySelector(".cursor-glow");
  glow.style.left=e.clientX+"px"; glow.style.top=e.clientY+"px";
});
function animate(){
  requestAnimationFrame(animate);
  tx += (mx-tx)*.035; ty += (my-ty)*.035;
  group.rotation.y += .0009;
  group.rotation.x = ty*.18;
  stars.rotation.y += .0004;
  knot.rotation.x += .004; knot.rotation.y += .006;
  ring.rotation.z += .003;
  camera.position.x += (tx*.35-camera.position.x)*.02;
  camera.position.y += (-ty*.2-camera.position.y)*.02;
  camera.lookAt(0,0,0);
  renderer.render(scene,camera);
}
animate();

addEventListener("resize",()=>{
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});

const revealItems = document.querySelectorAll(".reveal");

const progressBar = document.querySelector(".scroll-progress span");
const depthWords = document.querySelectorAll(".depth-word");
let scrollFrame = 0;
function updateScrollEffects() {
  const scrollable = document.documentElement.scrollHeight - innerHeight;
  progressBar.style.transform = `scaleX(${scrollable > 0 ? scrollY / scrollable : 0})`;
  revealItems.forEach(el => {
    const top = el.getBoundingClientRect().top;
    const start = innerHeight * .9;
    const end = innerHeight * .36;
    const progress = Math.max(0, Math.min(1, (start - top) / (start - end)));
    const eased = progress * progress * (3 - 2 * progress);
    const remaining = 1 - eased;
    const startScale = el.classList.contains("project") ? .94 : .82;
    el.style.setProperty("--reveal-opacity", eased.toFixed(3));
    el.style.setProperty("--reveal-y", `${remaining * 54}px`);
    el.style.setProperty("--reveal-z", `${remaining * -72}px`);
    el.style.setProperty("--reveal-tilt", `${remaining * 12}deg`);
    el.style.setProperty("--reveal-scale", `${startScale + (1 - startScale) * eased}`);
  });
  depthWords.forEach(word => {
    const position = word.getBoundingClientRect();
    const distance = (position.top + position.height / 2 - innerHeight / 2) / innerHeight;
    const shift = Math.max(-16, Math.min(16, distance * -22));
    const tilt = Math.max(-8, Math.min(8, distance * 10));
    word.style.setProperty("--scroll-shift", `${shift}px`);
    word.style.setProperty("--scroll-tilt", `${tilt}deg`);
  });
  scrollFrame = 0;
}
addEventListener("scroll", () => {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollEffects);
}, {passive:true});
addEventListener("resize", () => {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollEffects);
}, {passive:true});
updateScrollEffects();

document.querySelectorAll(".tilt-card").forEach(card=>{
  card.addEventListener("pointermove",e=>{
    if(innerWidth<850)return;
    const r=card.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
    card.style.transform=`perspective(900px) rotateX(${-y*8}deg) rotateY(${x*10}deg) translateZ(8px)`;
  });
  card.addEventListener("pointerleave",()=>card.style.transform="");
});

document.querySelectorAll(".magnetic").forEach(el=>{
  el.addEventListener("pointermove",e=>{
    const r=el.getBoundingClientRect();
    el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.18}px,${(e.clientY-r.top-r.height/2)*.18}px)`;
  });
  el.addEventListener("pointerleave",()=>el.style.transform="");
});

const menu=document.querySelector(".menu-btn");
const navigation=document.querySelector(".nav nav");
menu.addEventListener("click",()=>{
  const isOpen=navigation.classList.toggle("open");
  menu.setAttribute("aria-expanded",String(isOpen));
  menu.setAttribute("aria-label",isOpen?"Close menu":"Open menu");
});
document.querySelectorAll(".nav nav a").forEach(a=>a.addEventListener("click",()=>{
  navigation.classList.remove("open");
  menu.setAttribute("aria-expanded","false");
  menu.setAttribute("aria-label","Open menu");
}));

document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener("click",e=>{
    const target=document.querySelector(a.getAttribute("href"));
    if(target){e.preventDefault();target.scrollIntoView({behavior:"smooth"});}
  });
});
