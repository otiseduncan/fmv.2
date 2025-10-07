import { supabase } from './supabase';
import { fields as mockFields } from '../data/fieldData';
import { teamMembers as mockTeamMembers } from '../data/teamData';


export async function seedDatabaseForUser(userId: string): Promise<boolean> {
  try {
    console.log('Seeding database for user:', userId);

    // Seed jobs (fields table)

    const fieldsToInsert = mockFields.map(field => ({
      user_id: userId,
      name: field.name,
      location: field.location,
      size: field.size,
      crop: field.cropType,
      status: field.status === 'needs-attention' ? 'needs_attention' : field.status === 'harvested' ? 'harvesting' : field.status,
      soil_moisture: field.soilMoisture,
      temperature: 72,
      last_irrigated: field.lastInspection,
      next_irrigation: field.harvestDate,
      image_url: field.image,
      growth_stage: 'In Progress',
      expected_yield: field.yield
    }));


    const { data: insertedFields, error: fieldsError } = await supabase
      .from('fields')
      .insert(fieldsToInsert)
      .select();

    if (fieldsError) throw fieldsError;
    console.log('Seeded fields:', insertedFields?.length);

    // Seed team members
    const teamToInsert = mockTeamMembers.map(member => ({
      user_id: userId,
      name: member.name,
      role: member.role,
      email: member.email,
      phone: member.phone,
      avatar_url: member.avatar,
      status: member.status,
      assigned_fields: []
    }));


    const { data: insertedTeam, error: teamError } = await supabase
      .from('team_members')
      .insert(teamToInsert)
      .select();

    if (teamError) throw teamError;
    console.log('Seeded team members:', insertedTeam?.length);

    // Seed sample tasks (ADAS calibration)
    if (insertedFields && insertedFields.length > 0) {
      const tasksToInsert = [
        {
          user_id: userId,
          field_id: insertedFields[0].id,
          title: 'Pre-Scan — Camry',
          description: 'Perform diagnostic pre-scan before calibration',
          priority: 'high' as const,
          status: 'pending' as const,
          due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          user_id: userId,
          field_id: insertedFields[1]?.id || insertedFields[0].id,
          title: 'Set Radar Targets — F-150',
          description: 'Set radar targets and verify alignment',
          priority: 'medium' as const,
          status: 'in_progress' as const,
          due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      const { error: tasksError } = await supabase
        .from('tasks')
        .insert(tasksToInsert);

      if (tasksError) throw tasksError;
      console.log('Seeded tasks');
    }

    // Seed weather data (7 days)
    const weatherToInsert = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      return {
        user_id: userId,
        date: date.toISOString().split('T')[0],
        temperature: Math.floor(Math.random() * 15) + 20,
        condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 4)],
        humidity: Math.floor(Math.random() * 30) + 50,
        wind_speed: Math.floor(Math.random() * 20) + 5,
        precipitation: Math.floor(Math.random() * 50),
        icon: 'sun'
      };
    });

    const { error: weatherError } = await supabase
      .from('weather_data')
      .insert(weatherToInsert);

    if (weatherError) throw weatherError;
    console.log('Seeded weather data');

    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
}

// Dev helper: wipe all user data and reseed with ADAS-focused dataset
export async function wipeAndSeedDatabaseForUser(userId: string): Promise<boolean> {
  try {
    console.log('Wiping existing data for user:', userId);
    // Order matters due to FKs
    await supabase.from('tasks').delete().eq('user_id', userId);
    await supabase.from('weather_data').delete().eq('user_id', userId);
    await supabase.from('team_members').delete().eq('user_id', userId);
    await supabase.from('fields').delete().eq('user_id', userId);

    return await seedDatabaseForUser(userId);
  } catch (error) {
    console.error('Error wiping and seeding database:', error);
    return false;
  }
}
