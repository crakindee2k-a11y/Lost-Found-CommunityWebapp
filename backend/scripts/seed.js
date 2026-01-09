require('dotenv').config();

const User = require('../models/User');
const Post = require('../models/Post');

const parseBool = (value) => {
    if (value === undefined || value === null) return false;
    const v = String(value).trim().toLowerCase();
    return v === '1' || v === 'true' || v === 'yes' || v === 'on';
};

const getUniqueUsername = async (base) => {
    let username = base;
    let i = 1;
    while (await User.exists({ username })) {
        username = `${base}${i}`;
        i += 1;
    }
    return username;
};

const ensureUser = async ({ email, usernameBase, password, role, verificationStatus, resetPassword }) => {
    const existing = await User.findOne({ email });

    if (existing) {
        const update = {};
        if (role && existing.role !== role) update.role = role;
        if (verificationStatus && existing.verificationStatus !== verificationStatus) {
            update.verificationStatus = verificationStatus;
        }

        if (Object.keys(update).length > 0) {
            await User.findByIdAndUpdate(existing._id, { $set: update }, { new: true });
        }

        if (resetPassword) {
            const userWithPassword = await User.findById(existing._id).select('+password');
            userWithPassword.password = password;
            await userWithPassword.save();
        }

        return existing;
    }

    const username = await getUniqueUsername(usernameBase);

    const user = new User({
        username,
        email,
        password,
        phone: '',
        avatar: '',
        role: role || 'user',
        verificationStatus: verificationStatus || 'unverified'
    });

    await user.save();
    return user;
};

const ensurePost = async ({ title, userId, data }) => {
    const existing = await Post.findOne({ title, userId });
    if (existing) return existing;

    const post = new Post({
        ...data,
        title,
        userId
    });

    await post.save();
    return post;
};

const seedDemoData = async () => {
    const seedEnabled = parseBool(process.env.SEED_DEMO);
    if (!seedEnabled) return;

    const resetPasswords = parseBool(process.env.SEED_RESET_PASSWORDS);

    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@gmail.com';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'password123';
    const adminUsername = process.env.SEED_ADMIN_USERNAME || 'admin';

    const demoEmail = process.env.SEED_USER_EMAIL || 'demo@gmail.com';
    const demoPassword = process.env.SEED_USER_PASSWORD || 'password123';
    const demoUsername = process.env.SEED_USER_USERNAME || 'demo';

    if (process.env.NODE_ENV === 'production' && (adminPassword === 'password123' || demoPassword === 'password123')) {
        console.warn('⚠️  SEED_DEMO is enabled in production with a weak default password. Set SEED_ADMIN_PASSWORD/SEED_USER_PASSWORD to a strong value.');
    }

    console.log('🌱 Seeding demo data...');

    const adminUser = await ensureUser({
        email: adminEmail,
        usernameBase: adminUsername,
        password: adminPassword,
        role: 'admin',
        verificationStatus: 'verified',
        resetPassword: resetPasswords
    });

    const demoUser = await ensureUser({
        email: demoEmail,
        usernameBase: demoUsername,
        password: demoPassword,
        role: 'user',
        verificationStatus: 'verified',
        resetPassword: resetPasswords
    });

    const now = Date.now();

    const demoPosts = [
        {
            title: 'Lost iPhone near Central Park',
            data: {
                description: 'Black iPhone with a clear case. Lost around the park entrance. If found, please message me through the app.',
                type: 'lost',
                category: 'electronics',
                dateLost: new Date(now - 2 * 24 * 60 * 60 * 1000),
                location: {
                    address: 'Central Park, New York',
                    coordinates: { lat: 40.785091, lng: -73.968285 }
                },
                images: [
                    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=60'
                ],
                status: 'active',
                tags: ['demo', 'seed', 'iphone', 'phone']
            }
        },
        {
            title: 'Found Wallet at Bus Station',
            data: {
                description: 'Brown leather wallet found near the ticket counter. Contains cards and a photo ID. Please verify details to claim.',
                type: 'found',
                category: 'documents',
                dateFound: new Date(now - 12 * 60 * 60 * 1000),
                location: {
                    address: 'Main Bus Station, Downtown',
                    coordinates: { lat: 23.8103, lng: 90.4125 }
                },
                images: [
                    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=60'
                ],
                status: 'active',
                tags: ['demo', 'seed', 'wallet']
            }
        },
        {
            title: 'Lost Keys with Red Keychain',
            data: {
                description: 'A bunch of keys with a red keychain. Lost near the coffee shop. Please contact via in-app message.',
                type: 'lost',
                category: 'keys',
                dateLost: new Date(now - 5 * 24 * 60 * 60 * 1000),
                location: {
                    address: 'City Coffee, Main Road',
                    coordinates: { lat: 23.7806, lng: 90.2794 }
                },
                images: [
                    'https://images.unsplash.com/photo-1508161773455-3ada8ed2bbec?auto=format&fit=crop&w=1200&q=60'
                ],
                status: 'active',
                tags: ['demo', 'seed', 'keys']
            }
        },
        {
            title: 'Found Backpack (Blue) near University',
            data: {
                description: 'Blue backpack found near the university gate. Looks like it contains notebooks and a charger.',
                type: 'found',
                category: 'bags',
                dateFound: new Date(now - 36 * 60 * 60 * 1000),
                location: {
                    address: 'University Gate, Campus Area',
                    coordinates: { lat: 23.7772, lng: 90.3995 }
                },
                images: [
                    'https://images.unsplash.com/photo-1526481280695-3c687fd643ed?auto=format&fit=crop&w=1200&q=60'
                ],
                status: 'active',
                tags: ['demo', 'seed', 'backpack', 'bag']
            }
        }
    ];

    for (const p of demoPosts) {
        await ensurePost({ title: p.title, userId: demoUser._id, data: p.data });
    }

    console.log('✅ Demo data seeded');
    console.log(`🔐 Admin login: ${adminEmail} / ${adminPassword === 'password123' ? 'password123 (change this!)' : '(custom password set)'}`);
    console.log(`👤 Demo login: ${demoEmail} / ${demoPassword === 'password123' ? 'password123 (change this!)' : '(custom password set)'}`);

    return { adminUser, demoUser };
};

const seedDemoDataIfEnabled = async () => {
    try {
        await seedDemoData();
    } catch (error) {
        console.error('❌ Seeding failed:', error);
    }
};

module.exports = {
    seedDemoData,
    seedDemoDataIfEnabled
};

if (require.main === module) {
    const { connectDB, disconnectDB } = require('../config/database');

    connectDB()
        .then(() => seedDemoDataIfEnabled())
        .then(() => disconnectDB())
        .then(() => process.exit(0))
        .catch(async (err) => {
            console.error(err);
            try {
                await disconnectDB();
            } catch (_) {
            }
            process.exit(1);
        });
}
