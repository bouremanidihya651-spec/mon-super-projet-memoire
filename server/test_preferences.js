const { User, UserPreference } = require('./models');

async function testRegistration() {
  try {
    console.log('🔍 Testing UserPreference storage...\n');

    // Find a test user
    const testUser = await User.findOne({ 
      where: { email: 'solo.adventurer@example.com' },
      include: [{ model: UserPreference, as: 'preference' }]
    });

    if (testUser) {
      console.log('✅ User found:', testUser.email);
      console.log('📊 User data:', {
        id: testUser.id,
        username: testUser.username,
        travelerType: testUser.travelerType
      });

      // Check if UserPreference exists
      const preference = await UserPreference.findOne({ 
        where: { userId: testUser.id } 
      });

      if (preference) {
        console.log('\n✅ UserPreference found!');
        console.log('📊 Preferences:', {
          userId: preference.userId,
          travelerType: preference.travelerType,
          luxury_score: preference.luxury_score,
          nature_score: preference.nature_score,
          adventure_score: preference.adventure_score,
          culture_score: preference.culture_score,
          beach_score: preference.beach_score,
          food_score: preference.food_score,
          minBudget: preference.minBudget,
          maxBudget: preference.maxBudget,
          preferredTags: preference.preferredTags
        });
      } else {
        console.log('\n❌ UserPreference NOT found for this user!');
      }
    } else {
      console.log('❌ Test user not found');
    }

    // List all UserPreferences
    console.log('\n\n📋 All UserPreferences in database:');
    const allPrefs = await UserPreference.findAll();
    console.log(`Total: ${allPrefs.length} records`);
    allPrefs.forEach(p => {
      console.log(`  - userId: ${p.userId}, travelerType: ${p.travelerType}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

testRegistration();
