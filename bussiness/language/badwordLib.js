'use strict';
    const
        prohibited = [
            'dcm', 'vl', 'đcm', 'đkm', 'đm', 'chó', 'vcl', 'ngu thế', 'ngu the',
            'Đm', 'Dm', 'DM', "địt", "Địt","địt mẹ", "dit me",
            'mày', 'sao mày', 'sao may ngu', 'sao mày ngu', 'ngu thế', 'ngu the',
            'vai lon', 'vãi lồn', 'lồn', 'phụ khoa', 'phu khoa', 'fuck', 'fucking',
            'bullshit', 'bull shit', 'shit'
        ],
        config = require('config');

module.exports = {
    badWordChecker: function (value) {
        var regex = new RegExp(prohibited.map(function (s) {
            return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
        }).join('|'));
        return regex.test(value);
    }
};