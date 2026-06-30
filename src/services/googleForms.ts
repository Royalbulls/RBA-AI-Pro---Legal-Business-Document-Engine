import { DocumentField } from '../types';

interface CreateFormResponse {
  formId: string;
  responderUri: string;
  info: {
    title: string;
    description: string;
    documentTitle: string;
  };
}

interface ItemReply {
  itemId: string;
  questionId: string[];
}

interface BatchUpdateResponse {
  formId: string;
  replies: {
    createItem?: ItemReply;
  }[];
}

export interface FormIntake {
  formId: string;
  responderUri: string;
  editUri: string;
  title: string;
  contractType: string;
  dateCreated: string;
  brandHeaderUri?: string;
  fieldMappings: {
    [questionId: string]: {
      key: string;
      label: string;
      type: string;
    };
  };
}

export interface FormResponseSubmission {
  responseId: string;
  submittedAt: string;
  email: string;
  answers: {
    [key: string]: any; // Map of field key to submitted answer value
  };
}

/**
 * Theme settings representation for mapping branded aesthetics to standard Google Form styles
 */
export interface GoogleFormThemeSettings {
  primaryColor: string;          // Primary design layout color hex
  themeColor: string;            // Secondary accent theme color hex
  backgroundColor: string;       // Form background color hex
  backgroundStyle: 'LIGHT' | 'MEDIUM' | 'DARK' | 'WHITE'; // Corresponding background theme style
  headerFontStyle: {
    fontFamily: string;          // Premium font for headers
    fontSize: number;           // Standard Google Forms header size (24pt typical)
    boldUrl?: string;            // Optional font format URLs
  };
  questionFontStyle: {
    fontFamily: string;          // Premium font for form questions
    fontSize: number;           // Standard Google Forms question size (12pt typical)
  };
  bodyFontStyle: {
    fontFamily: string;          // Premium font for description/body text
    fontSize: number;           // Standard Google Forms body text size (11pt typical)
  };
}

/**
 * Maps the platform's custom branding styles to specific Google Form 'themeSettings' properties
 * for consistent, luxury form presentation.
 */
export function getGoogleFormThemeSettings(
  style: 'royal-platinum' | 'classic-gold' | 'corporate-indigo' | 'custom-image'
): GoogleFormThemeSettings {
  switch (style) {
    case 'classic-gold':
      return {
        primaryColor: '#5C0612', // Ruby Mahogany
        themeColor: '#D4AF37',   // Imperial Gold Accent
        backgroundColor: '#FFFDF9', // Cream Warm White
        backgroundStyle: 'LIGHT',
        headerFontStyle: {
          fontFamily: 'Playfair Display',
          fontSize: 24,
        },
        questionFontStyle: {
          fontFamily: 'Georgia',
          fontSize: 12,
        },
        bodyFontStyle: {
          fontFamily: 'Georgia',
          fontSize: 11,
        },
      };

    case 'corporate-indigo':
      return {
        primaryColor: '#4F46E5', // Bold Tech Indigo
        themeColor: '#6366F1',   // Light Indigo or glass silver (#F5F5F5)
        backgroundColor: '#F5F7FF', // Ultra Light Blue-White
        backgroundStyle: 'LIGHT',
        headerFontStyle: {
          fontFamily: 'Space Grotesk',
          fontSize: 24,
        },
        questionFontStyle: {
          fontFamily: 'Inter',
          fontSize: 12,
        },
        bodyFontStyle: {
          fontFamily: 'Inter',
          fontSize: 11,
        },
      };

    case 'royal-platinum':
    case 'custom-image':
    default:
      return {
        primaryColor: '#1A1A1A', // Charcoal Black
        themeColor: '#E5E5E5',   // Platinum Accent
        backgroundColor: '#F9F9F9', // Crisp Minimal Gray Slate
        backgroundStyle: 'LIGHT',
        headerFontStyle: {
          fontFamily: 'Inter',
          fontSize: 24,
        },
        questionFontStyle: {
          fontFamily: 'Inter',
          fontSize: 12,
        },
        bodyFontStyle: {
          fontFamily: 'Inter',
          fontSize: 11,
        },
      };
  }
}

/**
 * Unicode-based font styling converter to inject premium typography into standard Google Form fields
 */
function toThemeFontStyle(text: string, style: 'royal-platinum' | 'classic-gold' | 'corporate-indigo' | 'custom-image'): string {
  const charMap: { [key: string]: string } = {};
  
  if (style === 'corporate-indigo') {
    // 𝗔-𝗭, 𝗮-𝘇 (Bold Sans-Serif)
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const boldUpper = ["𝗔","𝗕","𝗖","𝗗","𝗘","𝗙","𝗚","𝗛","𝗜","𝗝","𝗞","狠","𝗠","𝗡","𝗢","𝗣","𝗤","content-filtered-placeholder-L","𝗦","𝗧","𝗨","content-filtered-placeholder-R","𝗪","𝗫","𝗬","𝗭"];
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const boldLower = ["𝗮","𝗯","𝗰","𝗱","𝗲","𝗳","𝗴","𝗵","𝗶","𝗷","𝗸","𝗹","𝗺","𝗻","𝗼","𝗽","𝗾","𝗿","𝘀","𝘁","𝘂","𝘃","𝘄","𝘅","𝘆","𝘇"];
    
    upper.split('').forEach((char, i) => {
      // guard safety bounds
      if (boldUpper[i]) charMap[char] = boldUpper[i];
    });
    lower.split('').forEach((char, i) => {
      if (boldLower[i]) charMap[char] = boldLower[i];
    });
    // Let's replace placeholder filters manually
    charMap["L"] = "𝗟";
    charMap["R"] = "𝗥";
    charMap["V"] = "𝗩";
  } else if (style === 'classic-gold') {
    // 𝑨-𝒁, 𝒂-𝒛 (Bold Serif Italic)
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const serifUpper = ["𝑨","𝑩","𝑪","𝑫","𝑬","content-filtered-placeholder-F","𝑮","𝑯","𝑰","𝑱","𝑲","𝑳","𝑴","𝑵","𝑶","𝑷","𝑸","𝑹","𝑺","𝑻","𝑼","𝑽","𝑾","𝑿","𝒀","𝒁"];
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const serifLower = ["𝒂","𝒃","𝒄","𝒅","𝒆","𝒇","𝒈","content-filtered-placeholder-h","𝒊","𝒋","𝒌","𝒍","𝒎","𝒏","𝒐","𝒑","𝒒","𝒓","𝒔","𝒕","𝒖","𝒗","𝒘","𝒙","𝒚","𝒛"];

    upper.split('').forEach((char, i) => {
      if (serifUpper[i]) charMap[char] = serifUpper[i];
    });
    lower.split('').forEach((char, i) => {
      if (serifLower[i]) charMap[char] = serifLower[i];
    });
    charMap["F"] = "𝑭";
    charMap["h"] = "𝒉";
  } else if (style === 'royal-platinum') {
    // 𝖠-𝖡 (Slightly Monospace-like Sans Serif)
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const typewriterUpper = ["𝖠","𝖡","𝖢","𝖣","𝖤","𝖥","𝖦","𝖧","𝖨","𝖩","𝖪","𝖫","𝖬","𝖭","𝖮","𝖯","𝖰","𝖱","𝖲","𝖳","𝖴","𝖵","𝖶","𝖷","𝖸","𝖹"];
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const typewriterLower = ["𝖺","𝖻","𝖼","𝖽","𝖾","𝖿","𝗀","𝗁","𝗂","𝗃","𝗄","𝗅","𝗆","𝗇","𝗈","𝗉","𝗊","𝗋","𝗌","𝗍","𝗎","𝗏","𝗐","𝗑","𝗒","𝗓"];

    upper.split('').forEach((char, i) => {
      if (typewriterUpper[i]) charMap[char] = typewriterUpper[i];
    });
    lower.split('').forEach((char, i) => {
      if (typewriterLower[i]) charMap[char] = typewriterLower[i];
    });
  }

  return text.split('').map(char => charMap[char] || char).join('');
}

/**
 * Creates a Google Form for collecting contract client details
 */
export async function createGoogleFormIntake(
  contractType: string,
  fields: DocumentField[],
  token: string,
  brandOption?: { 
    headerImageUri?: string; 
    headerTitle?: string; 
    headerDescription?: string;
    themeStyle?: 'royal-platinum' | 'classic-gold' | 'corporate-indigo' | 'custom-image';
  }
): Promise<FormIntake> {
  const chosenStyle = brandOption?.themeStyle || 'royal-platinum';
  
  // Format gorgeous custom titles & subtitles matching user styling using dynamic unicode fonts
  const baseTitle = `Intake Parameters: ${contractType}`;
  const styledTitle = toThemeFontStyle(baseTitle, chosenStyle);
  
  const rawDesc = `Secure pre-drafting client review form for ${contractType}. Authorized legal & corporate counsel workspace.`;
  const styledDesc = toThemeFontStyle(rawDesc, chosenStyle);

  // Step 1: Create Google Form with matching title
  const createFormRes = await fetch('https://forms.googleapis.com/v1/forms', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      info: {
        title: styledTitle
      }
    })
  });

  if (!createFormRes.ok) {
    const errorMsg = await createFormRes.text();
    throw new Error(`Failed to create base Google Form: ${errorMsg}`);
  }

  const baseForm = (await createFormRes.json()) as CreateFormResponse;
  const { formId, responderUri } = baseForm;

  // Step 2: Build items array
  const requests: any[] = [];

  // Update form description now since Forms API does not allow setting description during initial create payload
  requests.push({
    updateFormInfo: {
      info: {
        description: styledDesc
      },
      updateMask: 'description'
    }
  });

  // Determine Brand Palette metadata for consistency details
  let paletteDetails = "";
  if (chosenStyle === 'royal-platinum') {
    paletteDetails = "🎨 EXECUTIVE SLATE WORKSPACE: Charcoal Black (#1A1A1A) • Platinum Gray (#E5E5E5) • Minimal Sans-Serif font.";
  } else if (chosenStyle === 'classic-gold') {
    paletteDetails = "⚖️Traditional LAWYER Scales of Justice: Ruby Crimson & Mahogany (#5C0612) • Imperial Gold Accent (#D4AF37) • Traditional Serif font.";
  } else if (chosenStyle === 'corporate-indigo') {
    paletteDetails = "🏢 SLEEK INDUSTRIAL GLASS: Bold High-Tech Indigo (#4F46E5) • Glass Silver (#F5F5F5) • Modern Sans bold font.";
  } else {
    paletteDetails = "🔗 CUSTOM ADVISORY EMBLEM: Custom graphics header loaded successfully into Google Workspace.";
  }

  // Insert a beautiful brand info / brand control block at index 0 
  requests.push({
    createItem: {
      item: {
        title: toThemeFontStyle("BRAND IDENTITY & DESIGN STANDARDS", chosenStyle),
        description: `This assessment utilizes our customized advisory layout standards:\n${paletteDetails}\n\nAll captured values flow securely back into your advisory dashboard and auto-fill your documents securely.`,
        textItem: {}
      },
      location: {
        index: 0
      }
    }
  });

  // Insert a professional brand header image at index 1 if configured
  if (brandOption?.headerImageUri) {
    requests.push({
      createItem: {
        item: {
          title: toThemeFontStyle(brandOption.headerTitle || "Royal Bulls Client Intake Portal", chosenStyle),
          description: brandOption.headerDescription || "Pre-drafting legal parameters assessment.",
          imageItem: {
            image: {
              sourceUri: brandOption.headerImageUri,
              properties: {
                alignment: 'CENTER',
                width: 740
              }
            }
          }
        },
        location: {
          index: 1
        }
      }
    });
  }

  // Build question items from DocumentFields
  fields.forEach((field, fIdx) => {
    const isTextarea = field.type === 'textarea';
    const isToggle = field.type === 'toggle';

    const baseItem: any = {
      title: toThemeFontStyle(field.label, chosenStyle),
      description: field.description || `Please specify the parameter details for ${field.label.toLowerCase()}`
    };

    if (isToggle) {
      baseItem.questionItem = {
        question: {
          required: false,
          choiceQuestion: {
            type: 'RADIO',
            options: [
              { value: 'Yes' },
              { value: 'No' }
            ]
          }
        }
      };
    } else {
      baseItem.questionItem = {
        question: {
          required: true,
          textQuestion: {
            paragraph: isTextarea
          }
        }
      };
    }

    // Offset index: 
    // 1 (brand specs textItem at index 0) + 1 (header image at index 1 if present)
    const startingOffset = brandOption?.headerImageUri ? 2 : 1;
    const targetIdx = fIdx + startingOffset;

    requests.push({
      createItem: {
        item: baseItem,
        location: {
          index: targetIdx
        }
      }
    });
  });

  // Step 3: Add the questions (and optional brand header info) in batchUpdate
  const batchRes = await fetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests
    })
  });

  if (!batchRes.ok) {
    const errorMsg = await batchRes.text();
    throw new Error(`Failed to configure items on Google Form: ${errorMsg}`);
  }

  const configResult = (await batchRes.json()) as BatchUpdateResponse;

  // Step 4: Map the resulting questionIds back to the fields
  const fieldMappings: FormIntake['fieldMappings'] = {};
  
  // Calculate offset in replies: 
  // 1 (for updateFormInfo) + 1 (for brand identity card) + 1 (for headerImageUri if present)
  const replyOffset = 2 + (brandOption?.headerImageUri ? 1 : 0);
  
  fields.forEach((field, idx) => {
    const replyIdx = idx + replyOffset;
    const reply = configResult.replies[replyIdx];
    const qIds = reply?.createItem?.questionId;
    if (qIds && qIds.length > 0) {
      const questionId = qIds[0];
      fieldMappings[questionId] = {
        key: field.key,
        label: field.label,
        type: field.type || 'text'
      };
    }
  });

  return {
    formId,
    responderUri,
    editUri: `https://docs.google.com/forms/d/${formId}/edit`,
    title: baseTitle,
    contractType,
    dateCreated: new Date().toISOString(),
    brandHeaderUri: brandOption?.headerImageUri,
    fieldMappings
  };
}

/**
 * Fetches responses for a given Google Form and translates them down via fieldMappings
 */
export async function getGoogleFormResponses(
  formId: string,
  fieldMappings: FormIntake['fieldMappings'],
  token: string
): Promise<FormResponseSubmission[]> {
  const url = `https://forms.googleapis.com/v1/forms/${formId}/responses`;
  
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const errorMsg = await res.text();
    // If no responses have been submitted yet, Google API returns a 400 or has an empty state
    if (res.status === 400 || errorMsg.includes('no responses') || errorMsg.includes('NOT_FOUND')) {
      return [];
    }
    throw new Error(`Failed to fetch Google Form responses: ${errorMsg}`);
  }

  const data = await res.json();
  if (!data.responses || data.responses.length === 0) {
    return [];
  }

  return data.responses.map((rawResp: any) => {
    const answers: FormResponseSubmission['answers'] = {};
    const rawAnswers = rawResp.answers || {};

    // Map each answer according to our structured field mappings
    Object.keys(fieldMappings).forEach((questionId) => {
      const mapping = fieldMappings[questionId];
      const ansObj = rawAnswers[questionId];
      
      if (ansObj && ansObj.textAnswers && ansObj.textAnswers.answers) {
        const rawValues = ansObj.textAnswers.answers;
        if (rawValues.length > 0) {
          const ansVal = rawValues[0].value;
          
          if (mapping.type === 'toggle') {
            answers[mapping.key] = ansVal === 'Yes';
          } else {
            answers[mapping.key] = ansVal;
          }
        }
      }
    });

    return {
      responseId: rawResp.responseId,
      submittedAt: rawResp.lastSubmittedTime || rawResp.createTime,
      email: rawResp.respondentEmail || 'anonymous@gmail.com',
      answers
    };
  });
}
