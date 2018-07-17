app.service('UserService', [
  '$rootScope','CONFIG', '$resource', '$q', '$timeout',
  function($rootScope, CONFIG, $resource, $q, $timeout){
    var t = this;
    var csrf_token = '';


    function findFavoritesFolderInCache (nid) {
        var folder = t.user.favorites.filter(function(item){ return item.nid == nid; })[0];
        return folder || null;
    }



    this.connect = function () {
        var res = $resource(CONFIG.apiBaseUrl + '/system/connect', null, {
            'connect': {method: 'POST', widthCredentials: true, headers: { 'x-csrf-token': csrf_token }}
        });

        res.connect().$promise.then(function(data) {
            console.log(data);
        });
    }

    this.token = function () {

        var res = $resource(CONFIG.apiBaseUrl + '/user/token', null, {});
        var promise = res.save().$promise;

        promise.then(function(data){
            csrf_token = data.token;
        }).catch(function(err) {
            console.log(err);
        });

        return promise;
    }

    this.signIn = function (args) {
        var login = $resource(CONFIG.apiBaseUrl + '/user/login', null, {
            'login': { method: 'POST', withCredentials: true }
        });

        var promise = login.login({
            username: args.username,
            password: args.password
        }).$promise;

        promise.then(function (data) {
            csrf_token = data.token;
            t.user = {
                session_id: data.sessid,
                session_name: data.session_name,
                username: data.user.name,
                firstname: data.user.field_first_name.und[0].value,
                id: data.user.uid,
                loggedIn: true
            };
            return data;
        }, function (err) {
            // TODO: handle error?
            return err;
        }).finally(function(){
            $rootScope.$emit('processingFinished');
        });

        return promise;
    };

    this.signOut = function () {
        var logout = $resource(CONFIG.apiBaseUrl + '/user/logout', null, {
            'logout': { method: 'POST', isArray: true, withCredentials:true, headers: { 'x-csrf-token': csrf_token } }
        });

        var promise = logout.logout().$promise;

        promise.then(function (data) {
            t.user = null;
            csrf_token = '';
            return data;
        }, function (err) {
            t.user = null;
            csrf_token = '';
            // TODO: remove this when logout works
            // TODO: handle error?
            return err;
        });

        return promise;
    };

    this.requestNewPassword = function(email) {
        var res = $resource(CONFIG.apiBaseUrl + '/user/request_new_password', null, {
            request: {method: 'POST', isArray: true}
        });
        var promise = res.request({
            name: email
        }).$promise;

        promise.then(function(data){

        }).catch(function(err){
            console.log(err);
        }).finally(function(){
            $rootScope.$emit('processingFinished');
        });

        $rootScope.$emit('processingStart');
        return promise;
    }

    this.register = function (data) {
        var res = $resource(CONFIG.apiBaseUrl + '/user/register', null, {});

        var promise = res.save({
            name: data.username,
            pass: data.password,
            mail: data.email,
            field_first_name: { und: [{
                value: data.first_name
            }]},
            field_last_name: { und: [{
                value: data.last_name
            }]},
            field_address_line_1: { und: [{
                value: data.address_line_1
            }]},
            field_address_line_2: { und: [{
                value: data.address_line_2
            }]},
            field_state: { und: data.state },
            field_zip: { und: [{
                value: data.zip
            }]}
        }).$promise;

        promise.then(function(data) {
            return data;
        }).catch(function (err) {
            console.log(err);
        }).finally(function(){
            $rootScope.$emit('processingFinished');
        });

        return promise;
    };

    this.getUser = function () {
        if(t.user){
            return angular.extend({}, t.user, {token: csrf_token});
        }

        return null;
    };

    // TODO: rework how favorites are removed if we have time.
    this.removeFavorites = function (nid_arr) {

    }


    // used on Favorites folder page
    this.updateFavorites = function (nid_arr, folder_nid) {
        var favoritesPostData = nid_arr.map(function(item){
            return { target_id: item !== "" ? "& (" + item + ")" : "" };
        });

        var res = $resource(CONFIG.apiBaseUrl + '/node/:nid', null,
            {
                save: {method: 'PUT', withCredentials:true, headers: { 'x-csrf-token': csrf_token } }
            });

        var promise = res.save({
            nid: folder_nid
        },
        {
            "field_favorite_resources": {
                "und": favoritesPostData
            }
        }).$promise;
        return promise;
    }

  }

]);
