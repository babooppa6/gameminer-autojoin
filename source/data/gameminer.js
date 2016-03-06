// gameminer bot by tackyou
//
// settings
var gactive = false, gdelay = 15, gcoalmin = 0, gcoalmax = 100, ggoldmin = 0, ggoldmax = 100, gsgold = false, gregion = false, gafree = false;

refreshSettings();
function refreshSettings(){
	chrome.storage.local.get('gameminerbot_delay', function (result){
		if(result.gameminerbot_delay != undefined){
			gdelay = result.gameminerbot_delay;
		}
	});
	//
	chrome.storage.local.get('gameminerbot_coalmin', function (result){
		if(result.gameminerbot_coalmin != undefined){
			gcoalmin = result.gameminerbot_coalmin;
		}
	});
	chrome.storage.local.get('gameminerbot_coalmax', function (result){
		if(result.gameminerbot_coalmax != undefined){
			gcoalmax = result.gameminerbot_coalmax;
		}
	});
	chrome.storage.local.get('gameminerbot_goldmin', function (result){
		if(result.gameminerbot_goldmin != undefined){
			ggoldmin = result.gameminerbot_goldmin;
		}
	});
	chrome.storage.local.get('gameminerbot_goldmax', function (result){
		if(result.gameminerbot_goldmax != undefined){
			ggoldmax = result.gameminerbot_goldmax;
		}
	});
	//
	chrome.storage.local.get('gameminerbot_enabled', function (result){
		if(result.gameminerbot_enabled != undefined){
			gactive = result.gameminerbot_enabled;
		}
	});
	chrome.storage.local.get('gameminerbot_spendgold', function (result){
		if(result.gameminerbot_spendgold != undefined){
			gsgold = result.gameminerbot_spendgold;
		}
	});
	chrome.storage.local.get('gameminerbot_regionfreeonly', function (result){
		if(result.gameminerbot_regionfreeonly != undefined){
			gregion = result.gameminerbot_regionfreeonly;
		}
	});
	chrome.storage.local.get('gameminerbot_alwaysjoinfree', function (result){
		if(result.gameminerbot_alwaysjoinfree != undefined){
			gafree = result.gameminerbot_alwaysjoinfree;
		}
	});
}
// working values
var giveawaysjoined = 0, i = 0, x = 1, category = "coal", categories = ["coal", "sandbox", "golden"], coal = $('span.g-coal-big-icon span.user__coal'), gold = $('span.g-gold-big-icon span.user__gold'), yourcoal = +(coal.text()), yourgold = +(gold.text());
$(function(){
	if(!gactive){
		console.log('Gameminer Bot is disabled, please activate in settings');
	}else{
		if(!isLoggedIn()){
			console.log('Gameminer is not logged in, please log in!');
		}else{
			console.log('Gameminer Bot is running');
			console.log('[GMAJ # ' + new Date().toString() +'] # Coal: '+yourcoal+', Gold: '+yourgold);
			cycle(); // lets go
			setTimeout(pointrefill, 3600000);
		}
	}
});
//
function isLoggedIn(){
	var e = $('.account__menu li a');
	if(e.length>0 && e.attr('href').indexOf('logout')>-1){
		return true;
	}
	return false;
}

function cycle() {
	try{
		x = 1;
		refreshSettings();
		category = categories[i];
		$.get('http://gameminer.net/giveaway/' + category + '?type=any&q=&sortby=finish&order=asc&filter_entered=on', function(content){
			console.log('[GMAJ # ' + new Date().toString() +'] # Browsing category ' + category + ' ...');
			var parsedcontent = $(content);
			$('.giveaway__container', parsedcontent).each(function(index){
				if((category == 'golden' && gsgold) || category != 'golden'){
					JoinIfNotDLC(this, category);
				}
			});
			i++;
			if(i > 2){
				i=0;
				setTimeout(cycle, gdelay * 60000); // every 15 minutes
				console.log('[GMAJ # ' + new Date().toString() +'] ### Giveaways joined: ' + giveawaysjoined + ', pausing for '+gdelay+' minutes ...');
			}else{
				setTimeout(cycle, 5000);
			}
		});
	}catch(e){
		console.log('[GMAJ] There was a problem ... retrying in 10 seconds!');
		setTimeout(cycle, 10000);
	}
}

function pointrefill(){
	yourcoal += 1;
	coal.text(yourcoal);
	setTimeout(pointrefill, 3600000);
}

function JoinIfNotDLC(content, category){
	var name = $('a.giveaway__name', content).text();
	var points = +($('.giveaway__main-info', content).next().find('p:nth-child(3) span').text().split(' ')[0]);
	var form = $('.giveaway__action form', content);
	var canjoin = form.hasClass('giveaway-join');
	var steamurl = $('.giveaway__topc a', content).attr('href'), steamappid = 0;
	var regionlock = $("span[class*='regionlock']", content);
	var regionlocked = regionlock != undefined && regionlock.length>0;
	if((gregion && regionlocked) || (category == 'golden' && (points > ggoldmax || points < ggoldmin) && !gafree) || (category != 'golden' && (points > gcoalmax || points < gcoalmin)&& !gafree)){
		canJoin = false;
	}else{
		if(steamurl != undefined){
			try{
				steamappid = steamurl.split('/app/')[1].split('/')[0];
			}catch(ex){
				// it's a bundle /sub/
				canJoin = false; // can't check them, can't join them.
				// you could make it check all games in the bundle some day .... maybe a bit overload tho
			}
		}
	}
	if(((category == 'golden' && points <= yourgold) || (category != 'golden' && points <= yourcoal)) && canjoin){
		console.log('[GMAJ # ' + new Date().toString() +'] # trying to join '+name);
		setTimeout(function(){
			var site = 'http://store.steampowered.com/api/appdetails/?appids='+steamappid;
			var yql = 'https://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from json where url="' + site + '"') + '&format=json';
			$.getJSON(yql, function(data) {
				var game;
				var json = data.query.results;
				for (var property in json) {
					if (json.hasOwnProperty(property)) {
						game = json[property];
						break;
					}
				}
				if(game != undefined && game.data != undefined && game.data.type != 'dlc'){
					$.post(form.attr('action'), form.serialize() + "&json=true", function(resp) {
						coal.text(resp.coal);
						gold.text(resp.gold);
						yourcoal = resp.coal;
						yourgold = resp.gold;
						console.log('[GMAJ # ' + new Date().toString() +'] # ('+points+'p) '+name);
						giveawaysjoined++;
					});
				}
			});
		}, 1000*x);
		x++;
	}
}