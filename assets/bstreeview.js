$(function() {
    var client = ZAFClient.init();
    client.invoke('resize', { width: '100%', height: '500px' });

    client.get('ticket.requester.id').then(
        function(data) {
            var user_id = data['ticket.requester.id'];
            requestUserInfo(client, user_id);
        }
    );
});

function requestUserInfo(client, id) {
  var settings = {
    url: '/api/v2/users/' + id + '.json',
    type:'GET',
    dataType: 'json',
  };

  client.request(settings).then(
    function(data) {
      showInfo(data);
    },
    function(response) {
      showError(response);
    }
  );
}

function readJson(Choice) {
   addTags('Choice');
   
  }

function showInfo(data) {
  var requester_data = {
    'name': data.user.name,
    'tags': data.user.tags,
    'created_at': formatDate(data.user.created_at),
    'last_login_at': formatDate(data.user.last_login_at)
  };

  var source = $("#requester-template").html();
  var template = Handlebars.compile(source);
  var html = template(requester_data);
  $("#content").html(html);
}

function formatDate(date) {
  var cdate = new Date(date);
  var options = {
    year: "numeric",
    month: "short",
    day: "numeric"
  };
  date = cdate.toLocaleDateString("en-us", options);
  return date;
}

function showError(response) {
  var error_data = {
    'status': response.status,
    'statusText': response.statusText
  };
  var source = $("#error-template").html();
  var template = Handlebars.compile(source);
  var html = template(error_data);
  $("#content").html(html);
}

function showChoice() {
    var source = $("#choice-template").html();
    var template = Handlebars.compile(source);
    $("#Route").html(template);
   }
  
  function showActive(Choice) {
  
    if (Choice == "BugReport") {
    showBugReport(Choice);
    } else {
    addTags(Choice);
    var data = {'Question': Choice};
    var source = $("#activestream-template").html();
    var template = Handlebars.compile(source);
    var html = template(data);
    $("#Route").html(html);
    }
  }

  function showBugReport(Choice) {
    addTags(Choice);
    client.invoke('resize', { width: '320', height: '4000px' });
    var source = $("#bugreport-template").html();
    var template = Handlebars.compile(source);
    $("#Route").html(template);
  }
  
    function addTags(Tag) {
      client.invoke("ticket.tags.add", Tag);
  }



/*! @preserve
 * bstreeview.js
 * Version: 1.0.0
 * Authors: Sami CHNITER <sami.chniter@gmail.com>
 * Copyright 2020
 * License: Apache License 2.0
 *
 * Project: https://github.com/chniter/bstreeview
 */
; (function ($, window, document, undefined) {
    "use strict";
    /**
     * Default bstreeview  options.
     */
    var pluginName = "bstreeview",
        defaults = {
            expandIcon: 'fa fa-angle-down',
            collapseIcon: 'fa fa-angle-right',
            indent: 1.25
        };
    /**
     * bstreeview HTML templates.
     */
    var templates = {
        treeview: '<div class="bstreeview"></div>',
        treeviewItem: '<div href="#itemid" class="list-group-item" data-toggle="collapse"></div>',
        treeviewGroupItem: '<div class="list-group collapse" id="itemid"></div>',
        treeviewItemStateIcon: '<i class="state-icon"></i>',
        treeviewItemIcon: '<i class="item-icon"></i>'
    };
    /**
     * BsTreeview Plugin constructor.
     * @param {*} element 
     * @param {*} options 
     */
    function bstreeView(element, options) {
        this.element = element;
        this.itemIdPrefix = element.id + "-item-";
        this.settings = $.extend({}, defaults, options);
        this.init();
    }
    /**
     * Avoid plugin conflict.
     */
    $.extend(bstreeView.prototype, {
        /**
         * bstreeview intialize.
         */
        init: function () {
            this.tree = [];
            this.nodes = [];
            // Retrieve bstreeview Json Data.
            if (this.settings.data) {
                this.settings.data = $.parseJSON(this.settings.data);
                this.tree = $.extend(true, [], this.settings.data);
                delete this.settings.data;
            }
            // Set main bstreeview class to element.
            $(this.element).addClass('bstreeview');

            this.initData({ nodes: this.tree });
            var _this = this;
            this.build($(this.element), this.tree, 0);
            // Update angle icon on collapse
            $('.bstreeview').on('click', '.list-group-item', function () {
                $('.state-icon', this)
                    .toggleClass(_this.settings.expandIcon)
                    .toggleClass(_this.settings.collapseIcon);
            });
        },
        /**
         * Initialize treeview Data.
         * @param {*} node 
         */
        initData: function (node) {
            if (!node.nodes) return;
            var parent = node;
            var _this = this;
            $.each(node.nodes, function checkStates(index, node) {

                node.nodeId = _this.nodes.length;
                node.parentId = parent.nodeId;
                _this.nodes.push(node);

                if (node.nodes) {
                    _this.initData(node);
                }
            });
        },
        /**
         * Build treeview.
         * @param {*} parentElement 
         * @param {*} nodes 
         * @param {*} depth 
         */
        build: function (parentElement, nodes, depth) {
            var _this = this;
            // Calculate item padding.
            var leftPadding = "1.25rem;";
            if (depth > 0) {
                leftPadding = (_this.settings.indent + depth * _this.settings.indent).toString() + "rem;";
            }
            depth += 1;
            // Add each node and sub-nodes.
            $.each(nodes, function addNodes(id, node) {
                // Main node element.
                var treeItem = $(templates.treeviewItem)
                    .attr('href', "#" + _this.itemIdPrefix + node.nodeId)
                    .attr('style', 'padding-left:' + leftPadding);
                // Set Expand and Collapse icones.
                if (node.nodes) {
                    var treeItemStateIcon = $(templates.treeviewItemStateIcon)
                        .addClass(_this.settings.collapseIcon);
                    treeItem.append(treeItemStateIcon);
                }
                // set node icon if exist.
                if (node.icon) {
                    var treeItemIcon = $(templates.treeviewItemIcon)
                        .addClass(node.icon);
                    treeItem.append(treeItemIcon);
                }
                // Set node Text.
                treeItem.append(node.text);

                // Reset node href if present
                if (node.href) {
                    treeItem.attr('href', node.href);
                }

                // Add class to node if present
                if (node.class) {
                    treeItem.addClass(node.class);
                }

                // Attach node to parent.
                parentElement.append(treeItem);
                // Build child nodes.
                if (node.nodes) {
                    // Node group item.
                    var treeGroup = $(templates.treeviewGroupItem)
                        .attr('id', _this.itemIdPrefix + node.nodeId);
                    parentElement.append(treeGroup);
                    _this.build(treeGroup, node.nodes, depth);
                }
            });
        }
    });

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" +
                    pluginName, new bstreeView(this, options));
            }
        });
    };
})(jQuery, window, document);
