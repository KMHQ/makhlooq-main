import config from './payload.config';
console.log("Config imported successfully!");
console.log("Collections:", config.collections?.map(c => c ? c.slug : 'undefined'));
console.log("Globals:", config.globals?.map(g => g ? g.slug : 'undefined'));
