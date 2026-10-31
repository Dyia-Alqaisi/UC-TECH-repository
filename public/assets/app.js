'use strict';
const menu = document.querySelector('.menu-toggle');
const nav = document.getElementById('primary-nav');
menu?.addEventListener('click', () => {
 const expanded = menu.getAttribute('aria-expanded') === 'true';
 menu.setAttribute('aria-expanded',String(!expanded));nav.classList.toggle('open',!expanded);
});
const solutionsToggle = document.querySelector('.solutions-toggle');
const solutionsMenu = document.getElementById('solutions-menu');
solutionsToggle?.addEventListener('click', () => {
 const expanded = solutionsToggle.getAttribute('aria-expanded') === 'true';
 solutionsToggle.setAttribute('aria-expanded',String(!expanded));
 solutionsMenu.classList.toggle('open',!expanded);
});
document.addEventListener('click', e => {
 if(!e.target.closest('.nav-dropdown')){
  solutionsToggle?.setAttribute('aria-expanded','false');
  solutionsMenu?.classList.remove('open');
 }
});
document.addEventListener('keydown', e => {
 if(e.key !== 'Escape') return;
 if(solutionsToggle?.getAttribute('aria-expanded') === 'true'){
  solutionsToggle.setAttribute('aria-expanded','false');solutionsMenu.classList.remove('open');solutionsToggle.focus();return;
 }
 if(menu?.getAttribute('aria-expanded') === 'true'){
  menu.setAttribute('aria-expanded','false');nav.classList.remove('open');menu.focus();
 }
});
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
 menu?.setAttribute('aria-expanded','false');nav.classList.remove('open');
 solutionsToggle?.setAttribute('aria-expanded','false');solutionsMenu?.classList.remove('open');
}));

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('.light-field').forEach(field => {
 const stage=document.createElement('div');
 stage.className='trail-stage';stage.setAttribute('aria-hidden','true');
 ['upper','middle','lower','base'].forEach(name => {
  const layer=document.createElement('span');layer.className='trail-layer trail-'+name;stage.append(layer);
 });
 field.prepend(stage);
});
if(!reducedMotion){
 document.querySelectorAll('.light-field').forEach(field => {
  field.addEventListener('pointermove', e => {
   const box=field.getBoundingClientRect();
   field.style.setProperty('--mx',((e.clientX-box.left)/box.width*100).toFixed(1)+'%');
   field.style.setProperty('--my',((e.clientY-box.top)/box.height*100).toFixed(1)+'%');
  });
  field.addEventListener('pointerleave', () => {field.style.setProperty('--mx','72%');field.style.setProperty('--my','32%');});
 });
 document.querySelectorAll('.service-hero').forEach(hero => {
  const image=hero.querySelector('.service-hero-media img');
  if(!image) return;
  hero.addEventListener('pointermove', e => {
   const box=hero.getBoundingClientRect();
   const x=((e.clientX-box.left)/box.width-.5)*-2.4;
   const y=((e.clientY-box.top)/box.height-.5)*-1.5;
   image.style.setProperty('--banner-x',x.toFixed(2)+'%');
   image.style.setProperty('--banner-y',y.toFixed(2)+'%');
  });
  hero.addEventListener('pointerleave', () => {
   image.style.setProperty('--banner-x','0%');
   image.style.setProperty('--banner-y','0%');
  });
 });
 document.querySelectorAll('.service-card,.partner-card,.feature,.provider-card').forEach(card => {
  card.addEventListener('pointermove', e => {
   const box=card.getBoundingClientRect();
   card.style.setProperty('--card-x',((e.clientX-box.left)/box.width*100).toFixed(1)+'%');
   card.style.setProperty('--card-y',((e.clientY-box.top)/box.height*100).toFixed(1)+'%');
  });
 });
 const revealItems=[...document.querySelectorAll('.section-heading,.service-card,.partner-card,.feature,.cta-panel,.contact-detail,.client-card,.reach-points>div')];
 revealItems.forEach(item => item.classList.add('reveal-ready'));
 const observer=new IntersectionObserver(entries => entries.forEach(entry => {
  if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}
 }),{threshold:.12,rootMargin:'0px 0px -24px'});
 revealItems.forEach(item => observer.observe(item));
}
document.querySelectorAll('.service-hotspot').forEach(pin => {
 pin.addEventListener('click', e => {
  e.stopPropagation();
  const open=pin.getAttribute('aria-expanded')==='true';
  document.querySelectorAll('.service-hotspot[aria-expanded="true"]').forEach(other => other.setAttribute('aria-expanded','false'));
  pin.setAttribute('aria-expanded',String(!open));
 });
});
document.addEventListener('click', () => document.querySelectorAll('.service-hotspot[aria-expanded="true"]').forEach(pin => pin.setAttribute('aria-expanded','false')));

document.querySelectorAll('.region-pin').forEach(pin => {
 pin.addEventListener('click', event => {
  event.stopPropagation();
  const open=pin.getAttribute('aria-expanded')==='true';
  document.querySelectorAll('.region-pin[aria-expanded="true"]').forEach(other => other.setAttribute('aria-expanded','false'));
  pin.setAttribute('aria-expanded',String(!open));
 });
});
document.addEventListener('click', () => document.querySelectorAll('.region-pin[aria-expanded="true"]').forEach(pin => pin.setAttribute('aria-expanded','false')));
const form = document.getElementById('consultation');
document.querySelectorAll('[data-explorer]').forEach(explorer=>{
 const choices=[...explorer.querySelectorAll('[data-choice]')];
 function select(choice){
  choices.forEach(button=>{const active=button===choice;button.classList.toggle('selected',active);button.setAttribute('aria-pressed',String(active));document.getElementById(button.getAttribute('aria-controls')).hidden=!active;});
 }
 choices.forEach((button,index)=>{
  button.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')select(button);});
  button.addEventListener('focus',()=>select(button));
  button.addEventListener('click',()=>select(button));
  button.addEventListener('keydown',event=>{
   let next;
   if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(index+1)%choices.length;
   if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=(index-1+choices.length)%choices.length;
   if(event.key==='Home')next=0;
   if(event.key==='End')next=choices.length-1;
   if(next!==undefined){event.preventDefault();choices[next].focus();}
  });
 });
});
const geoControls=[...document.querySelectorAll('.geo-pin,.region-choice')];
const geoStatus=document.querySelector('.geo-selection');
function selectRegion(key){
 geoControls.forEach(el=>{const active=el.dataset.region===key;el.classList.toggle('selected',active);el.setAttribute('aria-pressed',String(active));});
 const card=document.querySelector('.region-choice[data-region="'+key+'"]');
 if(card&&geoStatus)geoStatus.textContent=card.querySelector('.region-choice-city').textContent+' — '+card.querySelector('strong').textContent;
}
geoControls.forEach(el=>{
 el.addEventListener('pointerenter',()=>selectRegion(el.dataset.region));
 el.addEventListener('focus',()=>selectRegion(el.dataset.region));
 el.addEventListener('click',()=>selectRegion(el.dataset.region));
 if(el.matches('.geo-pin'))el.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();selectRegion(el.dataset.region);}});
});
if(form){
 const fields = ['name','company','email','phone','service','message'];
 const review = document.getElementById('request-review'), done = document.getElementById('request-complete');
 const summary = document.getElementById('error-summary');
 const service = new URLSearchParams(location.search).get('service');
 if(['Cloud','AI','Cybersecurity','Multiple services','Help me choose'].includes(service)) form.elements.service.value=service;
 function clearError(el){el.removeAttribute('aria-invalid');el.removeAttribute('aria-describedby');document.getElementById(el.id+'-error').textContent='';}
 fields.forEach(id=>{const el=document.getElementById(id);el.addEventListener('input',()=>clearError(el));el.addEventListener('change',()=>clearError(el));});
 form.addEventListener('submit', e => {
  e.preventDefault();let first=null;let count=0;
  fields.forEach(id=>{const el=document.getElementById(id);clearError(el);let msg='';
   if(!el.value.trim())msg=id==='service'?'Choose a service.':'Please complete this field.';
   else if(id==='email' && el.validity.typeMismatch)msg='Enter a valid email address.';
   else if(id==='phone' && (!/^\+?[\d\s().-]+$/.test(el.value.trim()) || el.value.replace(/\D/g,'').length<7 || el.value.replace(/\D/g,'').length>15))msg='Enter a valid phone number, including your country code.';
   else if(id==='message' && el.value.trim().length<10)msg='Please enter at least 10 characters.';
   if(msg){el.setAttribute('aria-invalid','true');el.setAttribute('aria-describedby',id+'-error');document.getElementById(id+'-error').textContent=msg;count++;if(!first)first=el;}
  });
  summary.hidden=!count;
  if(count){summary.textContent='Please check '+count+' field'+(count===1?'':'s')+' below.';first.focus();return;}
  const list=document.getElementById('review-details');list.replaceChildren();
  const labels={name:'Full name',company:'Company',email:'Business email',phone:'Phone number',service:'Service',message:'Your requirements'};
  fields.forEach(id=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=labels[id];dd.textContent=document.getElementById(id).value.trim();list.append(dt,dd);});
  form.hidden=true;review.hidden=false;review.focus();
 });
 document.getElementById('edit-request').addEventListener('click',()=>{review.hidden=true;form.hidden=false;form.elements.name.focus();});
 let submissionKey = crypto.randomUUID();
 const sendButton=document.getElementById('complete-preview');
 sendButton.addEventListener('click',async()=>{
  if(sendButton.disabled)return;
  const error=document.getElementById('send-error');error.hidden=true;sendButton.disabled=true;sendButton.textContent='Sending…';
  try{
   const tokenResponse=await fetch('/api/csrf.php',{cache:'no-store',credentials:'same-origin'});
   if(!tokenResponse.ok)throw Error('The request service is unavailable. Please try again.');
   const {token}=await tokenResponse.json();
   const data=Object.fromEntries(fields.map(id=>[id,document.getElementById(id).value.trim()]));
   data.website=form.elements.website.value;data.submission_key=submissionKey;
   const response=await fetch('/api/requests.php',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-CSRF-Token':token},body:JSON.stringify(data)});
   const result=await response.json();
   if(!response.ok||!result.saved)throw Error(result.error||'We could not save your request. Please try again.');
   review.hidden=true;done.hidden=false;
   let reference=done.querySelector('.request-reference');if(!reference){reference=document.createElement('p');reference.className='request-reference';done.append(reference)}reference.textContent='Reference: '+result.id;
   form.reset();document.getElementById('review-details').replaceChildren();submissionKey=crypto.randomUUID();done.focus();
  }catch(e){error.textContent=e instanceof Error?e.message:'Unable to submit. Please try again.';error.hidden=false;}
  finally{sendButton.disabled=false;sendButton.textContent='Send request →';}
 });
 document.getElementById('restart-preview').addEventListener('click',()=>{done.hidden=true;form.hidden=false;summary.hidden=true;fields.forEach(id=>clearError(document.getElementById(id)));form.elements.name.focus();});
}
