/* Save the learner's own choices; restore against freshly loaded question data. */
const LessonProgress={
  capture(){
    if(typeof currentMocSession==='undefined'||!currentMocSession)return null;
    const s=currentMocSession;
    return {mocId:s.mocId,phase:s.phase,cardIndex:s.cardIndex,
      queue:(s.questionsQueue||[]).map(q=>q.ma_cau_hoi),mastered:s.masteredCount||0,
      firstCorrect:s.firstAttemptCorrectCount||0,failed:[...(s.failedQuestionsSet||[])],
      submissions:(s.submissions||[]).slice(-200),answer:s.currentAnswer||null,
      checked:Boolean(s.isAnswerChecked||s.isCurrentQuestionChecked),word:s.dienTuChosen||null,
      words:(s.arrangedTokens||[]).map(token=>token.word),pairs:s.matchingState?.matchedPairs||[],
      selectedLeft:s.matchingState?.selectedLeft||null,
      elapsed:s.currentQuestionStartTime?Math.max(0,Math.floor((Date.now()-s.currentQuestionStartTime)/1000)):0};
  },
  async restore(snapshot){
    if(!snapshot||!currentMocSession||snapshot.mocId!==currentMocSession.mocId)return false;
    const s=currentMocSession,byId=new Map((s.questions||[]).map(q=>[q.ma_cau_hoi,q]));
    const queue=Array.isArray(snapshot.queue)?snapshot.queue.map(id=>byId.get(id)).filter(Boolean):[];
    if(queue.length)s.questionsQueue=queue;
    s.masteredCount=Math.max(0,Math.min(byId.size,Number(snapshot.mastered)||0));
    s.firstAttemptCorrectCount=Math.max(0,Math.min(byId.size,Number(snapshot.firstCorrect)||0));
    s.failedQuestionsSet=new Set((snapshot.failed||[]).filter(id=>byId.has(id)));
    s.cardIndex=Math.max(0,Math.min((s.cards||[]).length-1,Number(snapshot.cardIndex)||0));
    s.phase=snapshot.phase==='PRACTICE_QUEUE'?'PRACTICE_QUEUE':'THEORY_CARDS';
    const submissions=(snapshot.submissions||[]).filter(answer=>byId.has(answer.ma_cau_hoi)).slice(-200);
    s.submissions=[];
    renderMocLearningScreen();
    const quizSound=audioSettings.quiz;audioSettings.quiz=false;
    try{
      if(s.phase==='PRACTICE_QUEUE'){
        const q=s.questionsQueue[0];if(!q)return false;
        if(q.loai_cau_hoi==='NOI_CAP'){
          for(const pair of snapshot.pairs||[]){
            const buttons=[...document.querySelectorAll('#q-options-container button[data-side]')];
            const left=buttons.find(b=>b.dataset.side==='left'&&b.dataset.item===pair.left);
            const right=buttons.find(b=>b.dataset.side==='right'&&b.dataset.item===pair.right);
            if(left&&right){selectNoiCapToken('left',pair.left,left);selectNoiCapToken('right',pair.right,right);}
          }
          if(snapshot.selectedLeft&&!s.isAnswerChecked){const left=[...document.querySelectorAll('#q-options-container button[data-side="left"]')].find(b=>b.dataset.item===snapshot.selectedLeft&&b.dataset.matched!=='true');if(left)selectNoiCapToken('left',snapshot.selectedLeft,left);}
        }else if(q.loai_cau_hoi==='DIEN_TU'){
          if(typeof snapshot.word==='string')selectDienTuWord(snapshot.word);
          if(snapshot.checked&&snapshot.word)await handleMocPracticeAction();
        }else if(q.loai_cau_hoi==='SAP_XEP_CAU'){
          const used=new Set();
          for(const word of snapshot.words||[]){
            const button=[...document.querySelectorAll('#sentence-token-bank button')].find(b=>b.dataset.token===word&&!used.has(b.dataset.tokenIdx));
            if(button){used.add(button.dataset.tokenIdx);addWordToConstruction(word,Number(button.dataset.tokenIdx));}
          }
          if(snapshot.checked&&s.arrangedTokens.length)await handleMocPracticeAction();
        }else if(snapshot.checked){
          const index=Number(snapshot.answer?.chi_muc_chon??snapshot.answer?.lua_chon);
          if(Number.isInteger(index)&&index>=0&&index<(q.dap_an||[]).length)selectTracNghiem(index);
        }
        s.currentQuestionStartTime=Date.now()-Math.min(3600,Math.max(0,Number(snapshot.elapsed)||0))*1000;
      }
    }finally{
      audioSettings.quiz=quizSound;
      s.submissions=submissions;
      if(snapshot.checked&&s.isAnswerChecked&&snapshot.answer)s.currentAnswer=snapshot.answer;
      s.firstAttemptCorrectCount=Math.max(0,Math.min(byId.size,Number(snapshot.firstCorrect)||0));
      s.failedQuestionsSet=new Set((snapshot.failed||[]).filter(id=>byId.has(id)));
    }
    return !snapshot.checked||Boolean(s.isAnswerChecked||s.isCurrentQuestionChecked);
  }
};
