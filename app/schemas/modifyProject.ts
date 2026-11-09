import * as yup from 'yup';

export const modifyProjectSchema = yup.object({
  ar_name: yup
    .string()
    .required('Project Name in Arabic is required')
    .min(3, 'Project Name in Arabic must be at least 3 characters')
    .max(30, 'Project Name in Arabic must be at most 30 characters'),
  en_name: yup
    .string()
    .required('Project Name in English is required')
    .min(3, 'Project Name in English must be at least 3 characters')
    .max(30, 'Project Name in English must be at most 30 characters'),
  ar_description: yup
    .string()
    .required('Project Description in Arabic is required')
    .min(10, 'Project Description in Arabic must be at least 10 characters'),
    // .max(30, 'Project Description in Arabic must be at most 30 characters'),
  en_description: yup
    .string()
    .required('Project Description in English is required')
    .min(10, 'Project Description in English must be at least 10 characters')
    // .max(30, 'Project Description in English must be at most 30 characters'),
});