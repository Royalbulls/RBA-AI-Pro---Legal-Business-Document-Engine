/**
 * Google Calendar API Service
 */

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  htmlLink: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  attendees?: {
    email: string;
    displayName?: string;
    responseStatus?: string;
    organizer?: boolean;
  }[];
  hangoutLink?: string; // Google Meet URL if populated
}

export interface CreateEventInput {
  summary: string;
  description: string;
  startDateTime: string; // ISO 8601 string
  endDateTime: string;   // ISO 8601 string
  clientEmail?: string;
  clientName?: string;
  location?: string;
  enableMeet?: boolean;
}

/**
 * Fetch upcoming events from the user's primary Google Calendar
 */
export async function fetchUpcomingEvents(token: string, maxResults = 15): Promise<CalendarEvent[]> {
  const timeMin = new Date().toISOString(); // Only fetch events from now onwards
  const queryParams = new URLSearchParams({
    timeMin,
    maxResults: maxResults.toString(),
    singleEvents: 'true',
    orderBy: 'startTime',
  });

  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google Calendar API returned ${response.status}: ${errText}`);
  }

  const data = await response.json();
  return (data.items || []) as CalendarEvent[];
}

/**
 * Create a new event on the user's primary calendar
 * Automatically requests a Google Meet video conference link if enableMeet is true
 */
export async function createCalendarEvent(token: string, input: CreateEventInput): Promise<CalendarEvent> {
  const {
    summary,
    description,
    startDateTime,
    endDateTime,
    clientEmail,
    clientName,
    location,
    enableMeet = true,
  } = input;

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  const eventResource: any = {
    summary,
    description,
    start: {
      dateTime: startDateTime,
      timeZone: userTimeZone,
    },
    end: {
      dateTime: endDateTime,
      timeZone: userTimeZone,
    },
  };

  if (clientEmail && clientEmail.trim() !== '') {
    eventResource.attendees = [
      {
        email: clientEmail.trim(),
        displayName: clientName ? clientName.trim() : undefined,
      },
    ];
  }

  if (location && location.trim() !== '') {
    eventResource.location = location.trim();
  }

  if (enableMeet) {
    eventResource.conferenceData = {
      createRequest: {
        requestId: `meet-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        conferenceSolutionKey: {
          type: 'hangoutsMeet',
        },
      },
    };
  }

  // To trigger Google Meet link generation, the conferenceDataVersion query param must be 1
  const queryParams = new URLSearchParams();
  if (enableMeet) {
    queryParams.append('conferenceDataVersion', '1');
  }

  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${queryParams.toString()}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(eventResource),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google Calendar API event creation failed (${response.status}): ${errText}`);
  }

  const createdEvent = await response.json();
  return createdEvent as CalendarEvent;
}

/**
 * Delete an event from the user's primary calendar
 */
export async function deleteCalendarEvent(token: string, eventId: string): Promise<void> {
  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google Calendar API event deletion failed (${response.status}): ${errText}`);
  }
}
