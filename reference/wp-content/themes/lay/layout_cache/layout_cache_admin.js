jQuery(document).ready(function($) {
    'use strict';
    
    // Cache building functionality
    var cacheBuilder = {
        isBuilding: false,
        progress: 0,
        totalItems: 0,
        processedItems: 0,
        items: [],
        currentIndex: 0,
        
        // Initialize the cache builder
        init: function() {
            this.bindEvents();
        },
        
        // Bind event listeners
        bindEvents: function() {
            jQuery('#build-all-cache-btn').on('click', function(e) {
                e.preventDefault();
                cacheBuilder.startBuilding();
            });
        },
        
        // Start the cache building process
        startBuilding: function() {
            if (this.isBuilding) {
                return;
            }
            
            this.isBuilding = true;
            this.progress = 0;
            this.processedItems = 0;
            this.currentIndex = 0;
            
            // Show loading UI
            this.showLoadingUI();
            
            // First, clear all cache, then fetch items
            this.clearAllCache();
        },
        
        // Clear all cache before building
        clearAllCache: function() {
            var self = this;
            
            this.updateStatusText('Clearing existing cache...');
            
            jQuery.ajax({
                url: ajaxurl,
                type: 'POST',
                data: {
                    action: 'clear_layout_cache',
                    nonce: layCacheAdmin.clear_cache_nonce
                },
                success: function(response) {
                    if (response.success) {
                        self.updateStatusText('Cache cleared. Fetching items...');
                        // Now get all posts, pages, and categories
                        self.fetchAllItems();
                    } else {
                        self.completeBuilding('Error clearing cache: ' + (response.data ? response.data : 'Unknown error'));
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Clear cache AJAX Error:', status, error);
                    self.completeBuilding('Error clearing cache. Please try again.');
                }
            });
        },
        
        // Fetch all items to cache
        fetchAllItems: function() {
            var self = this;
            
            jQuery.ajax({
                url: ajaxurl,
                type: 'POST',
                data: {
                    action: 'get_all_cacheable_items',
                    nonce: layCacheAdmin.nonce
                },
                success: function(response) {
                    if (response.success) {
                        self.items = response.data.items;
                        
                        // Limit to MAX_BUILD_CACHE_ITEMS
                        var maxItems = layCacheAdmin.max_build_items || 100;
                        if (self.items.length > maxItems) {
                            self.items = self.items.slice(0, maxItems);
                            console.info('Limiting cache build to first ' + maxItems + ' items');
                        }
                        
                        self.totalItems = self.items.length;
                        
                        if (self.totalItems > 0) {
                            self.updateProgressBar(0);
                            self.updateStatusText('Found ' + self.totalItems + ' items to cache. Starting...');
                            self.processNextItem();
                        } else {
                            self.completeBuilding('No items found to cache.');
                        }
                    } else {
                        self.completeBuilding('Error fetching items: ' + (response.data ? response.data : 'Unknown error'));
                    }
                },
                error: function(xhr, status, error) {
                    console.error('AJAX Error:', status, error);
                    self.completeBuilding('Error fetching items. Please try again.');
                }
            });
        },
        
        // Process the next item in the queue
        processNextItem: function() {
            if (this.currentIndex >= this.items.length) {
                // All items processed, rebuild master cache
                this.rebuildMasterCache();
                return;
            }
            
            var item = this.items[this.currentIndex];
            var self = this;
            
            // Preload the layout for this item
            this.preloadLayout(item.id, item.type, function(success) {
                self.processedItems++;
                self.currentIndex++;
                
                // Update progress
                var progress = Math.round((self.processedItems / self.totalItems) * 80); // 80% for individual items
                self.updateProgressBar(progress);
                self.updateStatusText('Processing item ' + self.processedItems + ' of ' + self.totalItems + ': ' + item.title);
                
                // Process next item with a small delay to prevent overwhelming the server
                setTimeout(function() {
                    self.processNextItem();
                }, 1000);
            });
        },
        
        // Preload layout for a specific item
        preloadLayout: function(id, type, callback) {
            var is_project_overlay = 'false';
            if (type === 'project' && layCacheAdmin.projects_overlays === 'on') {
                is_project_overlay = 'true';
            }
            
            var ajax_data = {
                action: 'get_laytheme_layout',
                is_project_overlay: is_project_overlay,
                id: id,
                type: type,
                password: '',
                is_cache_build: 'true',
            };
            
            jQuery.ajax({
                url: layCacheAdmin.ajax_url,
                data: ajax_data,
                type: 'post',
                success: function(json) {
                    try {
                        var result = JSON.parse(json);
                        console.log('result')
                        console.log(result)
                        // Only cache successful responses that don't require password
                        if (!result.hasOwnProperty('layout') || !result.layout.hasOwnProperty('password') || result.layout.password !== 'protected') {
                            callback(true);
                        } else {
                            callback(false);
                        }
                    } catch (e) {
                        console.error('JSON parse error:', e);
                        callback(false);
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Preload AJAX Error for', id, type, ':', status, error);
                    callback(false);
                }
            });
        },
        
        // Rebuild master cache
        rebuildMasterCache: function() {
            var self = this;
            
            this.updateStatusText('Rebuilding master cache...');
            this.updateProgressBar(85);
            
            jQuery.ajax({
                url: ajaxurl,
                type: 'POST',
                data: {
                    action: 'rebuild_master_cache_ajax',
                    nonce: layCacheAdmin.nonce
                },
                success: function(response) {
                    if (response.success) {
                        self.updateProgressBar(100);
                        self.updateStatusText('Master cache rebuilt successfully! Added ' + response.data.count + ' items to master cache.');
                        setTimeout(function() {
                            self.completeBuilding('Cache building completed successfully!');
                        }, 1000);
                    } else {
                        self.completeBuilding('Error rebuilding master cache: ' + (response.data ? response.data : 'Unknown error'));
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Master cache rebuild AJAX Error:', status, error);
                    self.completeBuilding('Error rebuilding master cache. Please try again.');
                }
            });
        },
        
        // Show loading UI
        showLoadingUI: function() {
            // Create loading overlay if it doesn't exist
            if (jQuery('#cache-building-overlay').length === 0) {
                var overlay = jQuery('<div id="cache-building-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 999999; display: flex; align-items: center; justify-content: center;">' +
                    '<div style="background: white; padding: 30px; border-radius: 8px; max-width: 500px; width: 90%; text-align: center;">' +
                    '<h3>Building Cache</h3>' +
                    '<div id="cache-progress-bar" style="width: 100%; height: 20px; background: #f0f0f0; border-radius: 10px; overflow: hidden; margin: 20px 0;">' +
                    '<div id="cache-progress-fill" style="width: 0%; height: 100%; background: #0073aa; transition: width 0.3s ease;"></div>' +
                    '</div>' +
                    '<div id="cache-status-text" style="margin: 10px 0; font-size: 14px; color: #666;">Initializing...</div>' +
                    '<div id="cache-progress-text" style="font-size: 12px; color: #999;">0%</div>' +
					'<div id="cache-please-dont-close" style="font-size: 10px; color: #999;">Please don\'t close this page until the cache is built.</div>' +
                    '</div>' +
                    '</div>');
                jQuery('body').append(overlay);
            } else {
                jQuery('#cache-building-overlay').show();
            }
            
            // Disable the button
            jQuery('#build-all-cache-btn').prop('disabled', true).text('Building Cache...');
        },
        
        // Update progress bar
        updateProgressBar: function(percentage) {
            jQuery('#cache-progress-fill').css('width', percentage + '%');
            jQuery('#cache-progress-text').text(percentage + '%');
        },
        
        // Update status text
        updateStatusText: function(text) {
            jQuery('#cache-status-text').text(text);
        },
        
        // Complete building process
        completeBuilding: function(message) {
            this.isBuilding = false;
            
            // Hide loading overlay
            jQuery('#cache-building-overlay').hide();
            
            // Re-enable the button
            jQuery('#build-all-cache-btn').prop('disabled', false).text('Build All Cache');
            
            // Show completion message
            if (message) {
                alert(message);
            }
            
            // Reload page to show updated stats
            location.reload();
        }
    };
    
    // Initialize the cache builder
    cacheBuilder.init();
});
