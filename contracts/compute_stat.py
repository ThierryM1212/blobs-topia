from random import randrange

p2Info = [1,1,0,0]


for i in range(0,100):
    my_i = 10 * i
    numVictories = round(my_i/2)
    att = my_i
    defense = my_i
    p1Info = [att, defense, my_i, numVictories]
    
    maxPowerDiff = 3300
    
    p1Power = 6*p1Info[0]+3*p1Info[1]+2*p1Info[2]+4*p1Info[3]
    p2Power = 6*p2Info[0]+3*p2Info[1]+2*p2Info[2]+4*p2Info[3]
    
    p1Def = 5*p1Info[0] + 5*p1Info[2]
    p2Def = 5*p2Info[0] + 5*p2Info[2]
    
    p1PowerAdj = min(p2Power + maxPowerDiff, p1Power)
    p2PowerAdj = min(p1Power + maxPowerDiff, p2Power)
    
    p1DefAdj = min(p2Def + maxPowerDiff, p1Def)
    p2DefAdj = min(p1Def + maxPowerDiff, p2Def)
    
    print("##############################################")
    print("P1 att: %s, def %s, game: %s, vic: %s" % (p1Info[0],p1Info[1],p1Info[2],p1Info[3]))
    print("P1 Power:%s P2 Power:%s" % (p1Power, p2Power))
    print("P1 def:%s P2 Power:%s" % (p1Def, p2Def))
    print("P1 Power adj:%s P2 Power adj:%s" % (p1PowerAdj,p2PowerAdj))
    print("P1 def adj:%s P2 Power adj:%s" % (p1DefAdj,p2DefAdj))
    
    p1Win = 0
    numMatch = 10000
    
    for j in range (0,numMatch):
    
        p1Rand = randrange(32767)
        p1Score = max(p1Rand, p1DefAdj) + p1PowerAdj
        
        p2Rand = randrange(32767)
        p2Score = max(p2Rand, p2DefAdj) + p2PowerAdj
    
        if (p1Score > p2Score):
            p1Win+= 1
        
    print("P1 win:%s (%s %%)" % (p1Win, p1Win/numMatch*100))
        