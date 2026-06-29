const { Event } = require('../models');

exports.getAllEvents = async (req, res) => {
  try {
    // Mengambil semua event dan mempopulasikan relasinya
    const events = await Event.find()
      .populate('organizer_id', 'full_name email')
      .populate('category_id', 'name')
      .populate('venue_id', 'name city address');

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil semua event',
      data: events
    });
  } catch (error) {
    console.error('Error getAllEvents:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      start_time, 
      event_date,
      end_time, 
      event_end_date,
      organizer_id, 
      category_id, 
      venue_id,
      poster_url,
      poster_image,
      is_free,
      ticket_types
    } = req.body;

    // Validasi sederhana (mudah dipahami)
    const finalEventDate = start_time || event_date;
    if (!title || !finalEventDate || !organizer_id) {
      return res.status(400).json({
        success: false,
        message: 'Title, start_time/event_date, dan organizer_id wajib diisi!',
        data: null
      });
    }

    const newEvent = await Event.create({
      title,
      description,
      event_date: finalEventDate,
      event_end_date: end_time || event_end_date,
      organizer_id,
      category_id: category_id || null,
      venue_id: venue_id || null,
      poster_image: poster_url || poster_image || 'https://via.placeholder.com/150',
      is_free: is_free || false,
      ticket_types: ticket_types || []
    });

    return res.status(201).json({
      success: true,
      message: 'Berhasil membuat event baru',
      data: newEvent
    });
  } catch (error) {
    console.error('Error createEvent:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
};
