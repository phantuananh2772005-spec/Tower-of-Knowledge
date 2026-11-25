const { createHash } = require('node:crypto');

function seededContentId(table, legacyId) {
  if (!legacyId) throw new Error('Missing source ID for ' + table);
  const bytes = createHash('sha256').update('thaptrithuc-v1-content/' + table + '/' + legacyId).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x80;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20, 32)].join('-');
}

const foundationReview = Object.freeze({
  milestoneId: seededContentId('milestones', 'moc_csdl_01_01'),
  stepCount: 4,
  questionsPerStep: 8
});

// These sourced questions cover material outside the 1.1 reading. Preserve them in the
// wider question bank and issued histories while filtering only this topic's review.
const foundationExcluded = [
  'q_csdl_01_s1_05', 'q_csdl_01_01_05', 'q_csdl_01_s1_09', 'q_csdl_01_01_09',
  'q_csdl_01_s2_01', 'q_csdl_01_s2_04', 'q_csdl_01_s2_05', 'q_csdl_01_s2_06', 'q_csdl_01_s2_07',
  'q_csdl_01_s3_01', 'q_csdl_01_s3_02', 'q_csdl_01_s3_03', 'q_csdl_01_s3_06',
  'q_csdl_01_s4_03', 'q_csdl_01_s4_04', 'q_csdl_01_s4_05'
].map(id => seededContentId('questions', id));

function getStudyQuestionExclusions(milestoneId) {
  return milestoneId === foundationReview.milestoneId ? foundationExcluded : [];
}

module.exports = { seededContentId, foundationReview, getStudyQuestionExclusions };
