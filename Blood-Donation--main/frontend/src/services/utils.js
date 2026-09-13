export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const URGENCY_LEVELS = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
export const REQUEST_STATUSES = ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'];

// Comprehensive list of Indian Cities, Towns & Villages for instant 1-letter search
export const CITIES_AND_VILLAGES = [
  'Agra', 'Ahmedabad', 'Ahmednagar', 'Aizawl', 'Ajmer', 'Akola', 'Aligarh', 'Allahabad (Prayagraj)', 'Alwar', 'Ambala',
  'Amravati', 'Amritsar', 'Anand', 'Anantapur', 'Arrah', 'Aurangabad', 'Avadi', 'Baghpat', 'Bahraich', 'Ballia',
  'Bally', 'Bangalore (Bengaluru)', 'Barabanki', 'Baranagar', 'Barasat', 'Bareilly', 'Bathinda', 'Begusarai', 'Belgaum', 'Bellary',
  'Berhampur', 'Bhagalpur', 'Bharatpur', 'Bhilai', 'Bhilwara', 'Bhiwandi', 'Bhiwani', 'Bhopal', 'Bhubaneswar', 'Bikaner',
  'Bilaspur', 'Bokaro', 'Bulandshahr', 'Buxar', 'Calicut (Kozhikode)', 'Chandigarh', 'Chandrapur', 'Chennai', 'Chinsurah', 'Chittoor',
  'Cuttack', 'Darbhanga', 'Darjeeling', 'Davanagere', 'Dehradun', 'Delhi', 'Deoghar', 'Dewas', 'Dhanbad', 'Dharwad',
  'Dhule', 'Durg', 'Durgapur', 'Eluru', 'Etawah', 'Faridabad', 'Farrukhabad', 'Fatehpur', 'Firozabad', 'Gandhinagar',
  'Gaya', 'Ghaziabad', 'Ghazipur', 'Gwalior', 'Haldwani', 'Hapur', 'Hardoi', 'Haridwar', 'Hisar', 'Howrah',
  'Hubli', 'Hyderabad', 'Ichalkaranji', 'Imphal', 'Indore', 'Jabalpur', 'Jaipur', 'Jalandhar', 'Jalgaon', 'Jalna',
  'Jammu', 'Jamnagar', 'Jamshedpur', 'Jhansi', 'Jodhpur', 'Junagadh', 'Kakinada', 'Kalyan', 'Kanchipuram', 'Kanpur',
  'Karimnagar', 'Karnal', 'Kharagpur', 'Kochi', 'Kolhapur', 'Kolkata', 'Kollam', 'Kota', 'Kottayam', 'Kurnool',
  'Latur', 'Lucknow', 'Ludhiana', 'Madurai', 'Mathura', 'Meerut', 'Mirzapur', 'Moradabad', 'Mumbai', 'Muzaffarnagar',
  'Muzaffarpur', 'Mysore', 'Nadiad', 'Nagercoil', 'Nagpur', 'Nanded', 'Nashik', 'Navi Mumbai', 'Nellore', 'Noida',
  'Panaji', 'Panipat', 'Patiala', 'Patna', 'Pondicherry', 'Pune', 'Purniab', 'Purulia', 'Rae Bareli', 'Raipur',
  'Rajahmundry', 'Rajkot', 'Ranchi', 'Ratlam', 'Rewa', 'Rohtak', 'Rourkela', 'Sagar', 'Saharanpur', 'Salem',
  'Sambalpur', 'Satara', 'Satna', 'Secunderabad', 'Shahjahanpur', 'Shimla', 'Shivamogga', 'Siliguri', 'Solapur', 'Sonipat',
  'Srinagar', 'Surat', 'Thane', 'Thiruvananthapuram', 'Thrissur,', 'Tiruchirappalli', 'Tirunelveli', 'Tirupati', 'Tirupur', 'Udaipur',
  'Ujjain', 'Vadodara', 'Varanasi', 'Vellore', 'Vijayawada', 'Visakhapatnam', 'Warangal', 'Yamunanagar'
];

export function formatDate(dateString) {
  if (!dateString) return '--';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

export function formatDateTime(dateString) {
  if (!dateString) return '--';
  const d = new Date(dateString);
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export function timeAgo(dateString) {
  if (!dateString) return '';
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
  if (seconds < 60) return 'just now';
  const intervals = [
    { label: 'year', secs: 31536000 },
    { label: 'month', secs: 2592000 },
    { label: 'day', secs: 86400 },
    { label: 'hour', secs: 3600 },
    { label: 'minute', secs: 60 }
  ];
  for (const i of intervals) {
    const count = Math.floor(seconds / i.secs);
    if (count >= 1) return `${count} ${i.label}${count > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

export function getInitials(name) {
  if (!name) return '?';
  return name.trim().split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function debounce(fn, delay = 350) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return Number(num).toLocaleString('en-IN');
}
