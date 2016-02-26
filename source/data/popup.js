/* CONFIGURATIONS */

$(function(){
    setDelay();
    checkoptions();

    $("#gdelay").keyup(function(){
        chrome.storage.local.set({'gameminerbot_delay': $(this).is(':checked')}, function() { 
            feedback("feedback");
        });
    });

    $("#gsgold").click(function(){
        chrome.storage.local.set({'gameminerbot_spendgold': $(this).is(':checked')}, function() { 
            feedback("feedback");
        });
    });

    $("#genable").click(function(){
        chrome.storage.local.set({'gameminerbot_enabled': $(this).is(':checked')}, function() { 
            feedback("feedback");
        });
    });

    $("#grfree").click(function(){
        chrome.storage.local.set({'gameminerbot_regionfreeonly': $(this).is(':checked')}, function() { 
            feedback("feedback");
        });
    });

    $("#show").click(function(){
        show();
    });
});

var timer;
function feedback(object) {
    document.getElementById(object).style.opacity = '100';
    timer = setInterval(function(){
        document.getElementById(object).style.opacity = '0';
        removeFeedback();
    }, 3000);
}
function removeFeedback() {
    clearInterval(timer);
}
function show() {
    var message = document.getElementById('message');
    if (message.innerHTML == "show") {
        document.getElementById('instructions').style.height = '372px';
        document.getElementById('actions').style.height = '0';
        message.innerHTML = "close";
    }
    else {
        document.getElementById('instructions').style.height = '46px';
        document.getElementById('actions').style.height = '326px';
        message.innerHTML = "show";
    }
}
function setDelay(){
    var v = 15;
    var o = getOption('gameminerbot_delay');
    if(o != null){
        v = o / 60000;
    }
    $('#gdelay').val(v);
}

function getOption(key){
    chrome.storage.local.get(key, function (result){
        return result[key] / 60000;
    });
    return null;
}

function checkoptions(){
    chrome.storage.local.get('gameminerbot_enabled', function (result){
        $('#genable').attr('checked', result.gameminerbot_enabled);
    });
    chrome.storage.local.get('gameminerbot_delay', function (result){
        $('#gdelay').attr('checked', result.gameminerbot_delay);
    });
    chrome.storage.local.get('gameminerbot_spendgold', function (result){
        $('#gsgold').attr('checked', result.gameminerbot_spendgold);
    });
    chrome.storage.local.get('gameminerbot_regionfreeonly', function (result){
        $('#grfree').attr('checked', result.gameminerbot_regionfreeonly);
    });
}