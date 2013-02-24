//
//   Copyright 2013 Dave Bacon
//
//   Licensed under the Apache License, Version 2.0 (the "License");
//   you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
//       http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
//   limitations under the License.
//

function TableIt(o, url, columns, sizes) {
	
	var t = this;
	
	// -------------------------------------------------------
	
	t.o = o;
	t.url = url;
	t.columns = columns;
	
	t.skipf = 0;
	t.sortf = '';
	t.sortdirf = 'ASC';
	t.currentmax = 0;
	
	
	// -------------------------------------------------------
	
	var pager = $('<div></div>').addClass('tableit-pager');
	
	var bFirst = $('<button/>').addClass('tableit-navbutton').html('&#x21e4;').click(function() { t.skipf = 0; t.redraw(); });
	var bPrev = $('<button/>').addClass('tableit-navbutton').html('&larr;').click(function() { t.skipf = Math.max(0, t.skipf - t.limitf()); t.redraw(); });
	var bNext = $('<button/>').addClass('tableit-navbutton').html('&rarr;').click(function() { t.skipf = Math.min(t.currentmax - t.limitf(), t.skipf + t.limitf()); t.redraw(); });
	var bLast = $('<button/>').addClass('tableit-navbutton').html('&#x21e5;').click(function() { t.skipf = t.currentmax - t.limitf(); t.redraw(); });
	
	t.limit = $('<select/>').change(function() { t.redraw(); });
	$.each(sizes, function(i, sz) {
		t.limit.append($('<option/>').val(sz).text(sz));
	});
	
	t.filter = $('<input>').attr('type', 'text').change(function() { t.redraw(); });
	
	t.rangeandmax = $('<span/>');
	
	t.tbody = $('<div></div>').addClass('tableit-container');
	
	
	// -------------------------------------------------------
	
	t.limitf = function() { return parseInt(t.limit.val()); };
	
	t.filterf = function() { return t.filter.val(); };
	
	t.colSortSuffix = function(colName) {
		var map = {
				'ASC': '&#x2197;',
				'DESC': '&#x2198;',
				'NONE': '&#x2192',
				};
		
		var label = t.sortf == colName ? (map[t.sortdirf]) : '&#x2192;';
		
		return $('<span></span>').html(label).addClass('tableit-sorter');
	};
	
	t.load = function(data) {
		
		t.currentmax = data['maxResults'];
		
		{
			var start = data['start'];
			var size = data['data'].length;
			t.rangeandmax.text(start + '~' + (start + size) + '/' + t.currentmax);
		}
		
		var hr = $('<tr></tr>').addClass('tableit-headerRow');
		$.each(t.columns, function(colName, colLabel) {
			hr.append($('<th></th>').addClass('tableit-headerCell').text(colLabel).append(t.colSortSuffix(colName)).click(function() {
				
				if (t.sortf == colName) {
					
					var curr = t.sortdirf;
					
					if (curr == 'NONE') t.sortdirf = 'ASC';
					else if (curr == 'ASC') t.sortdirf = 'DESC';
					else if (curr == 'DESC') t.sortdirf = 'NONE';
					else t.sortdirf = 'NONE';
					
				} else {
					t.sortf = colName;
					t.sortdirf = 'ASC';
				}
				
				t.redraw();
			}));
		});
		
		var rows = [];
		$.each(data.data, function(ri, rec) {
			var row = $('<tr></tr>').addClass('tableit-dataRow').addClass((ri % 2) == 0 ? 'tableit-rowEven' : 'tableit-rowOdd');
			$.each(t.columns, function(colName, colLabel) {
				row.append($('<td></td>')
						.text(rec[colName])
						.addClass('tableit-dataCell')
						.addClass((ri % 2) == 0 ? 'tableit-rowEven' : 'tableit-rowOdd'));
			});
			rows.push(row);
		});
		
		t.tbody.empty().append(
				$('<table></table>')
					.addClass('tableit-table')
					.append(hr)
					.append(rows)
					);

	};

	t.redraw = function() {
		$.getJSON(
				t.url,
				{
					"skip": t.skipf,
					"limit": t.limitf(),
					"sort": t.sortf + '/' + t.sortdirf,
					"filter": t.filterf(),
				},
				function(data, textstatus, jqxhr) {
					t.load(data);
				});
	};
	
	// -------------------------------------------------------
	
	t.createnode = function(x) {
		$(o).empty()
			.append(pager.append(bFirst).append(bPrev).append(t.limit).append(bNext).append(bLast).append(t.rangeandmax))
			.append(t.filter)
			.append(t.tbody);
		t.redraw();
		return $(o);
	};
};




$(function() {
	$.fn.tableit = function(options) {
		return new TableIt(this, options.url, options.columns, options.sizes).createnode(this);
	};
});

	
