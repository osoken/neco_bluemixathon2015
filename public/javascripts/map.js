!(function(d3,L,Ps)
{
  var map = {};
  var tracking = true;
  var zoom = 18;
  var mapLayer = null;
  var svgLayer = null;
  var plotLayer = null;
  var menuLayer = null;
  var selection = null;
  var idTagMap = {};
  var imageData = [];
  var smallW = 128;
  var smallH = 96;
  var bigW = 640;
  var bigH = 480;
  var timeFormat = d3.time.format('%Y/%m/%d %H:%M:%S');

  map.init = function(root)
  {
    selection = root;
    selection.style('height', (d3.select('html').node().getBoundingClientRect().height-12-smallH)+'px');
    var point = [35.730854409187884, 139.7169756889343];
    var focus = {original: new L.LatLng( 35.68036, 139.76798)};
    mapLayer = L.map(selection.attr('id')).setView(point, zoom);

    var tileLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution : '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapLayer);

    Ps.initialize(d3.select('div#list').node());
    svgLayer = d3.select(mapLayer.getPanes().overlayPane).append("svg")
      .on('mouseover', function(d)
      {
        plotLayer2.selectAll('g').attr('visibility','hidden');
      });
    plotLayer = svgLayer.append('g').attr('class', 'leaflet-zoom-hide');
    plotLayer2 = svgLayer.append('g').attr('class', 'leaflet-zoom-hide');
    logoLayer = svgLayer.append('g').attr('class', 'leaflet-zoom-hide');
    logoLayer.append('image').attr('xlink:href', 'images/neco.png')
      .attr('width',94).attr('height',45).attr('x',60).attr('y',10);

    var draw = function()
    {
      d3.json('/api/image', function(err,dat)
//      d3.json('image.json', function(err,dat)
      {
        dat.forEach(function(d,i)
        {
          d.loc = d.loc || [139.767981 + 0.1*i,35.680361];
          var tmp = d.loc[1];
          d.loc[1] = d.loc[0];
          d.loc[0] = tmp;
          d.pos = projectPoint(d.loc);
          d.tag = d.tag || [];
          d.image = d.image || '';
          d.emph = d.tags.some(function(dd)
          {
            return ['person','cat','dog'].some(function(ddd)
            {
              return dd==ddd;
            });
          });
        });
        var g = plotLayer.selectAll('g')
          .data(dat).enter().append('g')
          .attr('transform', function(d){return 'translate('+d.pos.x+','+d.pos.y+')';});

        g.append('rect').attr('class','frame');
        g.append('image').attr('xlink:href', function(d){return (d.image.startsWith('data'))?d.image:'data:image/png;base64,'+d.image;});

        plotLayer.selectAll('rect.frame')
          .attr('fill', function(d){return d.emph?'rgba(255,255,0,1.0)':'rgba(0,0,0,0)';})
          .attr('height', smallH*1.1).attr('width', smallW*1.1).attr('x',-(smallW*1.1*0.5)).attr('y',-(smallH*1.1*0.5));
        plotLayer.selectAll('image')
          .attr('height', smallH).attr('width',smallW).attr('x',-0.5*smallW).attr('y',-0.5*smallH);

        var g2 = plotLayer2.selectAll('g')
          .data(dat).enter().append('g')
          .attr('visibility', 'hidden')
          .attr('transform', function(d){return 'translate('+d.pos.x+','+d.pos.y+')';});
        g2.append('rect').attr('class','frame');
        g2.append('image').attr('xlink:href', function(d){return (d.image.startsWith('data'))?d.image:'data:image/png;base64,'+d.image;});
        g2.append('rect').attr('class','textbg');
        g2.append('text').attr('class','tag');
        g2.append('text').attr('class','loc')
          .text(function(d){return '[ '+d.loc.join(', ')+' ]';});
        g2.append('text').attr('class','time')
          .text(function(d){return d.timestamp;});

        plotLayer2.selectAll('rect.frame')
          .attr('fill', function(d){return d.emph?'rgba(255,255,0,1.0)':'rgba(0,0,0,0)';})
          .attr('height', bigH*1.1).attr('width', bigW*1.1).attr('x',-(bigW*1.1*0.5)).attr('y',-(bigH*1.1*0.5));
        plotLayer2.selectAll('image')
          .attr('height', bigH).attr('width',bigW).attr('x',-0.5*bigW).attr('y',-0.5*bigH);
        plotLayer2.selectAll('rect.textbg')
          .attr('height', 0.3*bigH).attr('width',bigW).attr('x',-0.5*bigW).attr('y',bigH*(0.5-0.3)).attr('fill','rgba(0,0,0,0.8)');
        plotLayer2.selectAll('text.tag')
          .text(function(d){return d.tags.join(' ');})
          .attr('x', -0.5*bigW).attr('font-size', 0.1*bigH).attr('fill','#FFF').attr('y',bigH*(0.5-0.2));
        plotLayer2.selectAll('text.loc')
          .attr('x', -0.5*bigW).attr('font-size', 0.1*bigH).attr('fill','#FFF').attr('y',bigH*(0.5-0.1));
        plotLayer2.selectAll('text.time')
          .attr('x', -0.5*bigW).attr('font-size', 0.1*bigH).attr('fill','#FFF').attr('y',bigH*(0.5-0.0));

        d3.select('div#list ul').style('width',((smallW+8)*dat.length)+'px').selectAll('li')
          .data(dat).enter().append('li')
          .style('margin','0').style('padding','0')
          .style('border', function(d){return d.emph?'4px solid rgba(255,255,0,1.0)':'4px solid rgba(0,0,0,0)';})
          .style('float','left')
          .append('img').attr('src', function(d){return (d.image.startsWith('data'))?d.image:'data:image/png;base64,'+d.image;})
          .style('width',smallW+'px').style('height',smallH+'px').style('margin','0').style('padding','0')
          .on('mouseover', function(d)
          {
            var focusId = d._id;
            plotLayer2.selectAll('g').attr('visibility',function(d){return (d._id==focusId)?'visible':'hidden';});
            mapLayer.setView(d.loc);
          });
        setTimeout(draw, 2000);
      });
    };
    draw();

    function projectPoint(x, y)
    {
      if (y===void 0)
      {
        return mapLayer.latLngToLayerPoint(x);
      }
      return mapLayer.latLngToLayerPoint(new L.LatLng(y, x));
    }
    function invertPoint(x, y)
    {
      if (y===void 0)
      {
        return mapLayer.layerPointToLatLng(x);
      }
      return mapLayer.layerPointToLatLng(new L.point(x,y));
    }

    function reset()
    {
      var bounds = mapLayer.getBounds();
      var topLeft = projectPoint(bounds.getNorthWest());
      var bottomRight = projectPoint(bounds.getSouthEast());

      svgLayer.attr("width", bottomRight.x - topLeft.x)
        .attr("height", bottomRight.y - topLeft.y)
        .style("left", topLeft.x + "px")
        .style("top", topLeft.y + "px");

      plotLayer.selectAll('g')
        .attr('transform',function(d){return 'translate('+projectPoint(d.loc).x+','+projectPoint(d.loc).y+')';});
      plotLayer.attr('transform', 'translate('+ -topLeft.x + ',' + -topLeft.y + ')')
      plotLayer2.selectAll('g')
        .attr('transform',function(d){return 'translate('+projectPoint(d.loc).x+','+projectPoint(d.loc).y+')';});
      plotLayer2.attr('transform', 'translate('+ -topLeft.x + ',' + -topLeft.y + ')')
    }
    mapLayer.on('click', function(e)
    {
      focus.original= e.latlng;
      console.log([e.latlng.lng,e.latlng.lat]);
      focus.pixcel = projectPoint(focus.original);
    });

    mapLayer.on("move", reset);
    reset();

  }

  this.map = map;
}(d3,L,Ps));
