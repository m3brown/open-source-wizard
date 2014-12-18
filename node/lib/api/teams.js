// Generated by IcedCoffeeScript 1.8.0-c
(function() {
  var couch_utils, request, teams, uuid;

  couch_utils = require('../couch_utils');

  request = require('request');

  uuid = require('node-uuid');

  teams = {};

  teams.create_team = function(req, resp) {
    var now, org, org_db, team_doc, team_id, team_name, user;
    now = +new Date();
    user = req.session.user;
    org = 'org_' + req.params.org_id;
    team_name = req.params.team_id;
    team_id = 'team_' + team_name;
    team_doc = {
      _id: team_id,
      name: team_name,
      rsrcs: {},
      roles: {},
      audit: [
        {
          u: user,
          dt: now,
          a: 't+',
          id: uuid.v4()
        }
      ],
      enforce: []
    };
    org_db = req.couch.use(org);
    return org_db.insert(team_doc).on('response', function(couch_resp) {
      if (couch_resp.statusCode < 400) {
        return org_db.get(team_id).pipe(resp);
      } else {
        return couch_resp.pipe(resp);
      }
    });
  };

  teams.get_team = function(req, resp) {
    var org, team;
    org = 'org_' + req.params.org_id;
    team = 'team_' + req.params.team_id;
    return couch_utils.nano_admin.use(org).get(team).pipe(resp);
  };

  teams.get_teams = function(req, resp) {
    var org;
    org = 'org_' + req.params.org_id;
    return couch_utils.nano_admin.use(org).viewWithList('base', 'by_type', 'get_docs', {
      include_docs: true
    }).pipe(resp);
  };

  teams.add_remove_member_asset = function(action_type) {
    return function(req, resp) {
      var action, db, org, team;
      org = 'org_' + req.params.org_id;
      team = 'team_' + req.params.team_id;
      db = req.couch.use(org);
      action = {
        action: action_type,
        key: req.params.key,
        value: req.params.value,
        uuid: uuid.v4()
      };
      return db.atomic('base', 'do_action', team, action).pipe(resp);
    };
  };

  teams.add_asset = function(req, resp) {
    var new_val;
    new_val = req.body["new"];
    if (!new_val) {
      return resp.status(400).end(JSON.stringify({
        'status': 'error',
        'msg': 'new value must be present'
      }));
    }
    req.params.value = {
      id: uuid.v4(),
      'new': new_val
    };
    console.log(req.body, req.params.value);
    return teams.add_remove_member_asset('a+')(req, resp);
  };

  module.exports = teams;

}).call(this);
