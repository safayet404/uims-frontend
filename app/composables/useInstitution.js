// What kind of institution this deployment serves (INSTITUTION_TYPE on the
// backend): university, school or coaching. Loaded once by plugins/app-config.
export const useInstitution = () => {
  const config = useState('appConfig', () => ({ institution_type: 'university', name: 'UniCore', demo_roles: [] }))

  const type = computed(() => config.value.institution_type || 'university')
  const isUniversity = computed(() => type.value === 'university')
  const isSchool = computed(() => type.value === 'school')
  const isCoaching = computed(() => type.value === 'coaching')

  // Words that differ between institutions
  const terms = computed(() => ({
    teacher: isUniversity.value ? 'Faculty' : 'Teacher',
    teachers: isUniversity.value ? 'Faculty' : 'Teachers',
    group: isCoaching.value ? 'Batch' : 'Section',
    groups: isCoaching.value ? 'Batches' : 'Sections',
  }))

  return { config, type, isUniversity, isSchool, isCoaching, terms }
}
