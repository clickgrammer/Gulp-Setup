import LazyLoad from 'vanilla-lazyload';

const lazyLoadInstance = new LazyLoad({
  elements_selector: '.lazy',
});
if (lazyLoadInstance) {
  lazyLoadInstance.update();
}
