export const EMAIL_TEMPLATE_BY_KEY_QUERY = `*[_type == "emailTemplate" && key.current == $key][0]{
  subject,
  preheader,
  "headerLogoUrl": headerLogo.asset->url,
  body[]{ 
    ..., 
    _type == "emailImage" => { 
      "image": { 
        "asset": { "url": image.asset->url } 
      } 
    } 
  }
}`;
