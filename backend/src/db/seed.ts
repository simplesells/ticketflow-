import db, { generateCode } from './database';

export async function seed() {
  const r = await db.execute('SELECT COUNT(*) as c FROM workorders');
  const count = r.rows[0]?.c as number;
  if (count > 0) return;

  const now = new Date().toISOString();
  const items: any[] = [
    { title: '打印机无法打印', description: '三楼财务部打印机输出空白页', type: '报修', priority: '高', status: '处理中', assignee: '周伟' },
    { title: '申请更换办公椅', description: '腰部支撑不足，建议更换人体工学椅', type: '建议', priority: '低', status: '待处理', assignee: '' },
    { title: '会议室投影仪故障', description: '大会议室投影仪亮度下降，影响演示', type: '报修', priority: '紧急', status: '待处理', assignee: '' },
    { title: '咨询企业邮箱容量', description: '想了解邮箱存储上限', type: '咨询', priority: '低', status: '已解决', assignee: '李刚' },
    { title: '投诉空调温度过低', description: '研发部办公室温度长期过低', type: '投诉', priority: '中', status: '已关闭', assignee: '孙强' },
    { title: '网络访问缓慢', description: '下午3-4点内网速度明显下降', type: '报修', priority: '高', status: '处理中', assignee: '周伟' },
    { title: '服务器内存告警', description: '监控显示服务器内存使用率连续3天超过90%', type: '报修', priority: '紧急', status: '待处理', assignee: '' },
    { title: '新员工入职设备申请', description: '下周入职3名新员工，需要配备笔记本和显示器', type: '咨询', priority: '中', status: '待处理', assignee: '' },
  ];

  for (const item of items) {
    const code = await generateCode();
    await db.execute(
      'INSERT INTO workorders (code, title, description, type, priority, status, assignee, history, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, \'[]\', ?, ?)',
      [code, item.title, item.description, item.type, item.priority, item.status, item.assignee, now, now],
    );
  }
}
