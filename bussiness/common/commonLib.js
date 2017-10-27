module.exports = {
    URLToArray: function (url) {
        var request = {};
        var pairs = url.substring(url.indexOf('?') + 1).split('&');
        for (var i = 0; i < pairs.length; i++) {
            if (!pairs[i])
                continue;
            var pair = pairs[i].split('=');
            request[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
        }
        return request;
    },
    getRandomInt: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    base64UrlDecode: function (input) {
        return Buffer.from(this.strtr(input, '-_,', '+/='), 'base64').toString('utf8');
    },
    
    base64UrlEndcode: function (input) {
        return this.strtr(Buffer.from(input).toString('base64'), '+/=', '-_,');
    },
    
    strtr: function (str, trFrom, trTo) {
        //  discuss at: http://locutus.io/php/strtr/
        // original by: Brett Zamir (http://brett-zamir.me)
        //    input by: uestla
        //    input by: Alan C
        //    input by: Taras Bogach
        //    input by: jpfle
        // bugfixed by: Kevin van Zonneveld (http://kvz.io)
        // bugfixed by: Kevin van Zonneveld (http://kvz.io)
        // bugfixed by: Brett Zamir (http://brett-zamir.me)
        // bugfixed by: Brett Zamir (http://brett-zamir.me)
        //   example 1: var $trans = {'hello' : 'hi', 'hi' : 'hello'}
        //   example 1: strtr('hi all, I said hello', $trans)
        //   returns 1: 'hello all, I said hi'
        //   example 2: strtr('äaabaåccasdeöoo', 'äåö','aao')
        //   returns 2: 'aaabaaccasdeooo'
        //   example 3: strtr('ääääääää', 'ä', 'a')
        //   returns 3: 'aaaaaaaa'
        //   example 4: strtr('http', 'pthxyz','xyzpth')
        //   returns 4: 'zyyx'
        //   example 5: strtr('zyyx', 'pthxyz','xyzpth')
        //   returns 5: 'http'
        //   example 6: strtr('aa', {'a':1,'aa':2})
        //   returns 6: '2'

        var krsort = require('./krsort')
        var iniSet = require('./ini_set')

        var fr = ''
        var i = 0
        var j = 0
        var lenStr = 0
        var lenFrom = 0
        var sortByReference = false
        var fromTypeStr = ''
        var toTypeStr = ''
        var istr = ''
        var tmpFrom = []
        var tmpTo = []
        var ret = ''
        var match = false

        // Received replace_pairs?
        // Convert to normal trFrom->trTo chars
        if (typeof trFrom === 'object') {
            // Not thread-safe; temporarily set to true
            // @todo: Don't rely on ini here, use internal krsort instead
            sortByReference = iniSet('locutus.sortByReference', false)
            trFrom = krsort(trFrom)
            iniSet('locutus.sortByReference', sortByReference)

            for (fr in trFrom) {
                if (trFrom.hasOwnProperty(fr)) {
                    tmpFrom.push(fr)
                    tmpTo.push(trFrom[fr])
                }
            }

            trFrom = tmpFrom
            trTo = tmpTo
        }

        // Walk through subject and replace chars when needed
        lenStr = str.length
        lenFrom = trFrom.length
        fromTypeStr = typeof trFrom === 'string'
        toTypeStr = typeof trTo === 'string'

        for (i = 0; i < lenStr; i++) {
            match = false
            if (fromTypeStr) {
                istr = str.charAt(i)
                for (j = 0; j < lenFrom; j++) {
                    if (istr === trFrom.charAt(j)) {
                        match = true
                        break
                    }
                }
            } else {
                for (j = 0; j < lenFrom; j++) {
                    if (str.substr(i, trFrom[j].length) === trFrom[j]) {
                        match = true
                        // Fast forward
                        i = (i + trFrom[j].length) - 1
                        break
                    }
                }
            }
            if (match) {
                ret += toTypeStr ? trTo.charAt(j) : trTo[j]
            } else {
                ret += str.charAt(i)
            }
        }

        return ret
    },
    checkPhoneNumber: function(phone) {
        var filter = /^[0]{1}[1-9]{1}[0-9]{8,9}$/;
        if (filter.test(phone)) {
            return true;
        }
        else {
            return false;
        }
    },
    validateEmail: function(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    },
    formatPrice: function(price, decPlaces, thouSeparator, decSeparator) {
        var n = price,
            decPlaces = isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces,
            decSeparator = decSeparator === undefined ? "." : decSeparator,
            thouSeparator = thouSeparator === undefined ? "," : thouSeparator,
            sign = n < 0 ? "-" : "",
            i = parseInt(n = Math.abs(+n || 0).toFixed(decPlaces)) + "",
            j = (j = i.length) > 3 ? j % 3 : 0;
        return sign + (j ? i.substr(0, j) + thouSeparator : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thouSeparator) + (decPlaces ? decSeparator + Math.abs(n - i).toFixed(decPlaces).slice(2) : "");
    },
    capitalizeFirstLetter: function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },
    replaceAll: function(str, find, replace) {
        return str.replace(new RegExp(find, 'g'), replace);
    },
    AdditionToArray: function (url) {
        var request = {};
        var pairs = url.split('&');
        for (var i = 0; i < pairs.length; i++) {
            if (!pairs[i])
                continue;
            var pair = pairs[i].split('=');
            request[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
        }
        return request;
    }
};