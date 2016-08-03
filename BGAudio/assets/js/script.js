/* Search */
$('.header .logo, .header .search-icon').click(function(e) {
	e.preventDefault();
	$('.header .audio-field').show();
});
$('.search-close').click(function(e) {
	e.preventDefault(); 
	$('.header .audio-field').hide();
});
/* /Search */

/* Tabs - Nav */
$('.nav a').click(function(e) {
	e.preventDefault();
	$('.nav a span').removeClass('on');
	$(this).addClass('on').siblings('a').removeClass('on');
	$(this).children('span').addClass('on');
});
/* /Tabs - Nav */

/* Tabs - Content */
$('.nav .trending').click(function(e) {
	e.preventDefault();
	$('.tab.trending').show().siblings('div').hide();
});
$('.nav .discover').click(function(e) {
	e.preventDefault();
	$('.tab.discover').show().siblings('div').hide();
});
$('.nav .favorite').click(function(e) {
	e.preventDefault();
	$('.tab.favorite').show().siblings('div').hide();
});
/* /Tabs - Content */

var list = document.querySelector('.tab.discover');
for (var i = list.children.length; i >= 0; i--) {
   // list.appendChild(list.children[Math.random() * i | 0]);
}