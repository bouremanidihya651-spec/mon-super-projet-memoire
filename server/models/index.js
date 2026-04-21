const User = require('./User');
const Destination = require('./Destination');
const Publication = require('./Publication');
const Hotel = require('./Hotel');
const HotelBackup = require('./HotelBackup');
const Activity = require('./Activity');
const Review = require('./Review');
const UserPreference = require('./UserPreference');
const Favorite = require('./Favorite');
const Transport = require('./Transport');
const Reservation = require('./Reservation');
const Invoice = require('./Invoice');

// Define associations
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Review -> Destination association
Review.belongsTo(Destination, { foreignKey: 'targetId', as: 'destination', constraints: false });
Destination.hasMany(Review, { foreignKey: 'targetId', as: 'reviews', constraints: false });

User.hasOne(UserPreference, { foreignKey: 'userId', as: 'preference' });
UserPreference.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Review, { as: 'destinationReviews', foreignKey: 'userId' });

// Favorite associations
User.hasMany(Favorite, { foreignKey: 'userId', as: 'favorites' });
Favorite.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Transport associations
Destination.hasMany(Transport, { foreignKey: 'destination_id', as: 'transports' });
Transport.belongsTo(Destination, { foreignKey: 'destination_id', as: 'destination' });

// Reservation associations
User.hasMany(Reservation, { foreignKey: 'user_id', as: 'reservations' });
Reservation.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Transport.hasMany(Reservation, { foreignKey: 'transport_id', as: 'reservations' });
Reservation.belongsTo(Transport, { foreignKey: 'transport_id', as: 'transport' });

// Invoice associations
User.hasMany(Invoice, { foreignKey: 'user_id', as: 'invoices' });
Invoice.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Reservation.hasOne(Invoice, { foreignKey: 'reservation_id', as: 'invoice' });
Invoice.belongsTo(Reservation, { foreignKey: 'reservation_id', as: 'reservation' });

// Hotel and Activity associations with Reservation
Hotel.hasMany(Reservation, { foreignKey: 'hotel_id', as: 'reservations' });
Reservation.belongsTo(Hotel, { foreignKey: 'hotel_id', as: 'hotel' });

Activity.hasMany(Reservation, { foreignKey: 'activity_id', as: 'reservations' });
Reservation.belongsTo(Activity, { foreignKey: 'activity_id', as: 'activity' });

module.exports = {
  User,
  Destination,
  Publication,
  Hotel,
  HotelBackup,
  Activity,
  Review,
  UserPreference,
  Favorite,
  Transport,
  Reservation,
  Invoice
};