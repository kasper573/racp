# github workflows require node to be able to read and write these directories
chmod -R a+rwX ./node_modules/.prisma
chmod -R a+rwX ./cypress
chmod -R a+rwX ./prisma