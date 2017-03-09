var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Favorites = require('../models/favorite');
var Verify = require('./verify');

var favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
    .get(function(req, res, next) {
        var userId = req.decoded._id;
        Favorites.find({
            "postedBy": userId
        })
            .populate('postedBy dishes')
            .exec(function(err, favorite) {
                if (err) next (err);
                res.json(favorite);
            });
    })

    .post(Verify.verifyOrdinaryUser, function(req, res, next) {
        var userId = req.decoded._id;
        Favorites.findOneAndUpdate({
            postedBy:userId
        }, {
                $addToSet:{
                    dishes:req.body
                }
           },
            {
            upsert:true,
            new:true
        }, function (err, favorite) {
               if(err) next (err);
               res.json(favorite);
            }
        );
    })

    .delete(Verify.verifyOrdinaryUser, function(req, res, next) {
        var userId = req.decoded._id;

        Favorites.findOneAndRemove({
            postedBy:userId
        },function (err, resp) {
            if(err) next (err);
            res.json(resp);
        });
    });

    favoriteRouter.route('/favorites/:dishObjectId')
        .delete(Verify.verifyOrdinaryUser, function(req, res, next) {
            var userId = req.decoded._id;
        Favorites.findOneAndUpdate(
            {
                postedBy:userId
            }, {
                 $pull:{
                     dishes:req.params.dishObjectId
                 }
            }, {
                new:true
            },function (err, favorite) {
                if(err) next (err);
                res.json(favorite);
            }
        );
        });

module.exports = favoriteRouter;
