/* 

Vanilla Template

https://templatemo.com/tm-526-vanilla

*/
var colorScale = d3.scaleOrdinal(d3.schemeCategory20);

var methaneChart;

loadData();

jQuery(document).ready(function($) {

	'use strict';

    var top_header = $('.parallax-content');
    top_header.css({'background-position':'center center'}); // better use CSS

    $(window).scroll(function () {
    var st = $(this).scrollTop();
    top_header.css({'background-position':'center calc(50% + '+(st*.5)+'px)'});
    });


    $('body').scrollspy({ 
        target: '.fixed-side-navbar',
        offset: 200
    });
      
      // smoothscroll on sidenav click

    $('.tabgroup > div').hide();
        $('.tabgroup > div:first-of-type').show();
        $('.tabs a').click(function(e){
          e.preventDefault();
            var $this = $(this),
            tabgroup = '#'+$this.parents('.tabs').data('tabgroup'),
            others = $this.closest('li').siblings().children('a'),
            target = $this.attr('href');
        others.removeClass('active');
        $this.addClass('active');
        $(tabgroup).children('div').hide();
        $(target).show();
      
    })

});

// Load CSV file
function loadData() {
    d3.csv("data/allFoods.csv", function(error, csv) {

        csv = csv.filter(function(d) {
            return d.Product !== "";
        });

        csv.forEach(function(d) {
            d.Farm = +d.Farm;
            d.Feed = +d.Feed;
            d.Packaging = +d.Packaging;
            d.Processing = +d.Processing;
            d.Retail = +d.Retail;
            d.Total = +d.Total;
            d.Transport = +d.Transport;
        });

        console.log(csv);

        // Store csv data in global variable
        data = csv;

        methaneChart = new MethaneTree("methane-vis", data);
    });
}

// Render visualization
function reset() {
    methaneChart.reset();
}

