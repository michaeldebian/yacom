const PAGES = [
  {path: '/users', admin: true, icon: 'users', name: 'Users'},
  {path: '/databases/cassandra', icon: 'database', name: 'Cassandra'},
  {path: '/servers', admin: true, icon: 'server', name: 'Servers'},
  {path: '/taxonomies/groups', admin: true, icon: 'object-group', name: 'Groups'},
  {path: '/taxonomies/apps', admin: true, icon: 'cogs', name: 'Apps'},
  {path: '/taxonomies/environments', admin: true, icon: 'globe', name: 'Environments'},
  {path: '/taxonomies/locations', admin: true, icon: 'map-marker', name: 'Locations'}
];

module.exports = function(req, res, next) {
  res.locals.pages = PAGES;
  res.locals.currentPage = req.path;
  next();
};
