import Contact from '../models/Contact.js';

export const createContact = async (req, res) => {
  const contact = await Contact.create(req.body);
  res.status(201).json({ message: 'Gửi liên hệ thành công.', contact });
};
